import express from "express";
import {
  getUsersByPopularity,
  getUsers,
  getUserProfile,
  followUser,
  getSuggestedUserstoFollow,
  getUserFeedPosts,
  getOnlineFriends,
} from "../Controllers/users.controllers.js";
import { authMiddleware } from "../Middleware/auth.middleware.js";

const router = express.Router();

router.get("/Popularity", getUsersByPopularity);

// tested :working
router.get("/", getUsers);

// tested :working
router.get("/profile/:id", getUserProfile);

// tested :working on postman
router.post("/follow/:id", authMiddleware, followUser);

// tested :working
router.get(
  "/suggestedUsersToFollow",
  authMiddleware,
  getSuggestedUserstoFollow
);

router.get("/userFeedPosts", authMiddleware, getUserFeedPosts);

router.get("/onlineFriends", authMiddleware, getOnlineFriends);

export default router;
