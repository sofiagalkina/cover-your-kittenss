import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
// 1) Grab whatever you set in Railway
const raw = process.env.FRONTEND_URL ?? ''

// 2) Log its exact contents (including any invisible chars)
console.log(`↳ raw FRONTEND_URL (len ${raw.length}): `, JSON.stringify(raw))

// 3) Normalize it—strip whitespace, semicolons, commas, whatever
const rawFrontend = raw
  .trim()                   // chop off leading/trailing spaces
  .replace(/[;,]+$/, '')    // drop any number of ; or , at the end

// 4) Build your final array
const FRONTEND_URLS = [
  rawFrontend,
  'http://localhost:3000'
].filter(Boolean)

// 5) Show us what’s really in there now
console.log(`↳ normalized FRONTEND_URL (len ${rawFrontend.length}): `, JSON.stringify(rawFrontend))
console.log(`↳ allowed origins:`, FRONTEND_URLS.map(u => JSON.stringify(u)))

// ✅ Serve CORS for HTTP routes (polling, preflight)
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, etc)
    if (!origin || FRONTEND_URLS.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error(`CORS policy violation: ${origin}`))
  },
  methods: ['GET','POST','OPTIONS'],
  credentials: true
}))

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Backend alive');
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URLS,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  }
});

const rooms: Record<string, string[]> = {};
const socketToRoom: Record<string, { code: string; username: string }> = {};

io.on('connection', (socket) => {
  console.log(`🔌 New connection: ${socket.id}`);

  socket.on('join-room', ({ code, username }) => {
    console.log(`👤 ${username} joining ${code}`);

    if (!rooms[code]) rooms[code] = [];
    if (!rooms[code].includes(username)) rooms[code].push(username);

    socketToRoom[socket.id] = { code, username };
    socket.join(code);

    io.to(code).emit('room-users', rooms[code]);
  });

  socket.on('disconnect', () => {
    const userData = socketToRoom[socket.id];
    if (userData) {
      const { code, username } = userData;
      rooms[code] = rooms[code].filter(name => name !== username);
      io.to(code).emit('room-users', rooms[code]);
      console.log(`❌ ${username} left ${code}`);
      delete socketToRoom[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Socket.io server running on port ${PORT}`);
});
