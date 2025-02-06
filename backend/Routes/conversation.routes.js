// converstaion routes
import express from "express";
import { authMiddleware } from "../Middleware/auth.middleware.js";
import {
  createConversation,
  getConversations,
  getQuickUnreadCount,
  getUnreadConversationsCount,
  markConversationAsSeen,
} from "../Controllers/conversation.controllers.js";

const router = express.Router();

// tested :working in postman
router.get("/", authMiddleware, getConversations);

// tested :working in postman
router.post("/:participantId", authMiddleware, createConversation);

router.patch("/:conversationId/seen", authMiddleware, markConversationAsSeen);

router.get("/unread", authMiddleware, getUnreadConversationsCount);

router.get("/unread/count", authMiddleware, getQuickUnreadCount);

export default router;
