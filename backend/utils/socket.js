const socketIO = require('socket.io');

let io;

const init = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    // Join user room
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join event room
    socket.on('join-event-room', (eventId) => {
      socket.join(`event-${eventId}`);
      console.log(`Client joined event room: ${eventId}`);
    });

    // Leave event room
    socket.on('leave-event-room', (eventId) => {
      socket.leave(`event-${eventId}`);
      console.log(`Client left event room: ${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Send notification to user
const sendNotification = (userId, notification) => {
  const io = getIO();
  io.to(`user-${userId}`).emit('notification', notification);
};

// Send event update to all users in event room
const sendEventUpdate = (eventId, update) => {
  const io = getIO();
  io.to(`event-${eventId}`).emit('event-update', update);
};

module.exports = {
  init,
  getIO,
  sendNotification,
  sendEventUpdate
};