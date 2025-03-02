import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import connectDB from './src/DB/db.js';
import bootstrap from '../Job Search -Exam/src/app.js';
import express from 'express';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();


bootstrap(app,express);

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Allow client to connect
    methods: ['GET', 'POST'],
  },
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room (e.g., chat room between two users)
  socket.on('joinRoom', ({ senderId, receiverId }) => {
    const roomId = [senderId, receiverId].sort().join('_'); // Create a unique room ID
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Listen for new messages
  socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
    try {
      // Ensure only HR or company owner can start the conversation
      const sender = await User.findById(senderId);
      if (!sender || (sender.role !== 'HR' && sender.role !== 'Company Owner')) {
        return socket.emit('error', 'Only HR or company owner can start the conversation');
      }

      // Find or create a chat
      let chat = await Chat.findOne({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      });

      if (!chat) {
        chat = await Chat.create({ senderId, receiverId, messages: [] });
      }

      // Add the new message to the chat
      chat.messages.push({ message, senderId });
      await chat.save();

      // Emit the message to the room
      const roomId = [senderId, receiverId].sort().join('_');
      io.to(roomId).emit('receiveMessage', { senderId, message });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Error sending message');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});




// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});