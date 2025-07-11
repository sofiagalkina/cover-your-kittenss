import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
// 1) Grab whatever you set in Railway
// Grab and aggressively clean
const raw = process.env.FRONTEND_URL ?? ''
console.log('↳ raw FRONTEND_URL:', JSON.stringify(raw))

const clean = raw
  .trim()                    // drop whitespace
  .replace(/^["';]+/, '')    // drop leading " or ' or ;
  .replace(/["';]+$/, '')    // drop trailing " or ' or ;

console.log('↳ cleaned FRONTEND_URL:', JSON.stringify(clean))

const FRONTEND_URLS = [ clean, 'http://localhost:3000' ].filter(Boolean)
console.log('↳ allowed origins:', FRONTEND_URLS)

// CORS
app.use(cors({
 origin: (origin, cb) => {
  if (!origin) return cb(null, true);
  const normalized = origin.replace(/\/+$/, '').toLowerCase(); // remove trailing slashes and lowercase
  if (FRONTEND_URLS.map(u => u.replace(/\/+$/, '').toLowerCase()).includes(normalized)) {
    return cb(null, true);
  }
  cb(new Error(`CORS violation: ${origin}`));
},
  methods: ['GET','POST','OPTIONS'],
  credentials: true
}))

// …Socket.IO constructor with the same FRONTEND_URLS…

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
