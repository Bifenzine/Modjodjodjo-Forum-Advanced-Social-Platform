import express from "express";
import { authMiddleware } from "../Middleware/auth.middleware.js";
import { getChatbotResponse } from "../services/chatbot.service.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Clan from "../models/clan.model.js";
import { chatbotAuthMiddleware } from "../Middleware/Chat.middleware.js";

const router = express.Router();

router.post("/ask", chatbotAuthMiddleware, async (req, res) => {
  const { messages } = req.body;

  if (!messages || !messages.length) {
    return res.status(400).json({ error: "Messages are required" });
  }

  try {
    let userContext = "User is not logged in";

    if (req.user) {
      const user = req.user;
      const posts = await Post.find({ user: user._id })
        .populate("category", "name")
        .populate("clan", "name")
        .lean();

      const postCount = posts.length;
      const joinDate = user.createdAt.toDateString();

      const totalUpvotes = posts.reduce(
        (sum, post) => sum + post.upVotes.length,
        0
      );
      const totalDownvotes = posts.reduce(
        (sum, post) => sum + post.downVotes.length,
        0
      );
      const totalComments = posts.reduce(
        (sum, post) => sum + post.comments.length,
        0
      );
      const totalShares = posts.reduce((sum, post) => sum + post.shareCount, 0);

      const categories = [
        ...new Set(posts.map((post) => post.category?.name).filter(Boolean)),
      ];

      const clans = await Clan.find({
        $or: [
          { admins: user._id },
          { moderators: user._id },
          { members: user._id },
        ],
      }).lean();

      const clanInfo = clans.map((clan) => {
        let role = "Member";
        if (clan.admins.includes(user._id)) role = "Admin";
        else if (clan.moderators.includes(user._id)) role = "Moderator";
        return `${clan.name} (${role})`;
      });

      const latestPost =
        posts.length > 0
          ? posts.sort((a, b) => b.createdAt - a.createdAt)[0]
          : null;

      userContext = `
User: ${user.username}
Joined: ${joinDate}
Total Posts: ${postCount}
Total Upvotes Received: ${totalUpvotes}
Total Downvotes Received: ${totalDownvotes}
Total Comments Received: ${totalComments}
Total Shares: ${totalShares}
Categories Posted In: ${categories.join(", ") || "None"}
Clans: ${clanInfo.join(", ") || "Not a member of any clan"}
Latest Post: ${
        latestPost
          ? `"${latestPost.title}" (${latestPost.timeSinceCreation})`
          : "No posts yet"
      }
      `.trim();
    }

    const response = await getChatbotResponse(messages, userContext);
    res.json({ response });
  } catch (error) {
    console.error("Error in chatbot route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
