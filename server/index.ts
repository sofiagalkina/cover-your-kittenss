import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Track socket-to-user mapping to remove on disconnect
const rooms: Record<string, string[]> = {};
const socketToRoom: Record<string, { code: string; username: string }> = {};

io.on('connection', (socket) => {
  console.log(`🔌 New connection: ${socket.id}`);

  socket.on('join-room', ({ code, username }) => {
    console.log(`👤 ${username} joining ${code}`);

    if (!rooms[code]) {
      rooms[code] = [];
    }

    if (!rooms[code].includes(username)) {
      rooms[code].push(username);
    }

    socketToRoom[socket.id] = { code, username };
    socket.join(code);
    io.to(code).emit('room-users', rooms[code]);
  });

  socket.on('disconnect', () => {
    const userData = socketToRoom[socket.id];
    if (userData) {
      const { code, username } = userData;
      rooms[code] = rooms[code].filter((name) => name !== username);
      io.to(code).emit('room-users', rooms[code]);
      console.log(`❌ ${username} left ${code}`);
      delete socketToRoom[socket.id];
    }
  });
});

server.listen(3001, () => {
  console.log('✅ Socket.io server running on port 3001');
});
