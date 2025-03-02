import express from 'express';
import Chat from '../models/chat';

const router = express.Router();

// 1. Get chat history with a specific user
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;
  const { senderId } = req.query;

  try {
    const chat = await Chat.findOne({
      $or: [
        { senderId, receiverId: userId },
        { senderId: userId, receiverId: senderId },
      ],
    }).populate('messages.senderId', 'firstName lastName');

    if (!chat) return res.status(404).json({ message: 'No chat history found' });

    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history', error });
  }
});

export default router;