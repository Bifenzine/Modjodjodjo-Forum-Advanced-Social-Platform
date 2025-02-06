import express from "express";
import { authMiddleware } from "../Middleware/auth.middleware.js";
import {
  addToBookmark,
  deleteFromBookmark,
  getBookmarkedPosts,
} from "../Controllers/bookmark.controllers.js";

const router = express.Router();

// Get all bookmarks for a specific post
router.get("/", authMiddleware, getBookmarkedPosts);

// Add post to bookmark list
router.post("/add/:postId", authMiddleware, addToBookmark);
// Delete Bookmarked post
router.delete("/delete/:postId", authMiddleware, deleteFromBookmark);

// Update a bookmark later for more options
// router.patch("update/:postId", authMiddleware, updateBookmark);

export default router;
