import express from "express";

import {
  getChatHistory,
  saveChatMessage,
} from "../controllers/chatHistoryController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/chat-history/:documentId
router.get("/:documentId", protect, getChatHistory);

// POST /api/chat-history/message
router.post("/message", protect, saveChatMessage);

export default router;
