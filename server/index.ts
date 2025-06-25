import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

// ✅ Serve CORS for HTTP routes (required for polling preflight)
app.use(cors({
  origin: 'https://cover-your-kittenss.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true,
}));

// ✅ Optional: health check route
app.get('/', (req, res) => {
  res.send('✅ Backend alive');
});

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'https://cover-your-kittenss.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  allowEIO3: true,
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
