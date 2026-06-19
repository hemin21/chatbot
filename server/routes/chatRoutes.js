import express from "express";
import {
  sendMessage,
  getAllChats,
  getChatById,
  deleteChat,
} from "../controllers/chatController.js";

const router = express.Router();

// POST /api/chat — send a message and get AI response
router.post("/chat", sendMessage);

// GET /api/chats — list all conversations
router.get("/chats", getAllChats);

// GET /api/chat/:id — get conversation with messages
router.get("/chat/:id", getChatById);

// DELETE /api/chat/:id — delete a conversation
router.delete("/chat/:id", deleteChat);

export default router;
