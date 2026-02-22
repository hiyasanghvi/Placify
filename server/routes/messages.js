import express from "express";
import Message from "../models/Message.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { io } from "../server.js"; // 🔥 add this

const router = express.Router();

/**
 * 🔹 POST /api/messages
 * Send a message
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { to, text } = req.body;

    if (!to || !text) {
      return res.status(400).json({ message: "Receiver and text required" });
    }

    // Create message
    let message = await Message.create({
      from: req.user.id,
      to,
      text
    });

    // Populate sender & receiver
    message = await message.populate("from", "name email");
    message = await message.populate("to", "name email");

    // 🔥 REAL-TIME EMIT TO RECEIVER
    io.to(to.toString()).emit("newMessage", message);

    res.status(201).json(message);

  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🔹 GET /api/messages/inbox
 * Get all conversations for logged-in user
 */
router.get("/inbox", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { from: req.user.id },
        { to: req.user.id }
      ]
    })
      .sort({ createdAt: -1 }) // latest first
      .populate("from", "name email")
      .populate("to", "name email");

    res.status(200).json(messages);

  } catch (error) {
    console.error("INBOX ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🔹 GET /api/messages/:userId
 * Get conversation between logged-in user & another user
 */
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { from: req.user.id, to: otherUserId },
        { from: otherUserId, to: req.user.id }
      ]
    })
      .sort({ createdAt: 1 }) // 🔥 important for single unified chat
      .populate("from", "name email")
      .populate("to", "name email");

    res.status(200).json(messages);

  } catch (error) {
    console.error("CONVERSATION ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;