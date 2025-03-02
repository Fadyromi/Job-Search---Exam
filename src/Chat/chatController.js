import Chat from "../models/chat.js";

export const createChat = async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    // Find or create a chat between sender and receiver
    let chat = await Chat.findOne({ senderId, receiverId });

    if (!chat) {
      chat = await Chat.create({ senderId, receiverId, messages: [] });
    }

    // Add the new message to the chat
    chat.messages.push({ message, senderId });
    await chat.save();

    // Emit the message to the room
    const roomId = [senderId, receiverId].sort().join("_");
    req.io.to(roomId).emit("receiveMessage", { senderId, message });

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Error creating chat", error });
  }
};
