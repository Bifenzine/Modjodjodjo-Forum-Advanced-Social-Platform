import User from "../models/user.model.js"; // Import User model
import Conversation from "../models/conversation.model.js"; // Import Conversation model
import Notification from "../models/notification.model.js"; // Import Notification model
import Post from "../models/post.model.js"; // Import Post model
import mongoose from "mongoose"; // Import mongoose for MongoDB operations
import { sendNotification } from "../socket/socket.js";

// Get users sorted by popularity
export const getUsersByPopularity = async (req, res) => {
  try {
    // Fetch all users and sort by popularity in descending order
    const usersByPopularity = await User.find().sort({ popularity: -1 });
    // Send the list of users as a JSON response
    res.json(usersByPopularity);
  } catch (error) {
    // Log error and send an internal server error response if something goes wrong
    console.log("Problem in the getPopular user controller", error.message);
    res.status(500).json({ error: "Internal Server Error get popular user" });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();
    // Send the list of users as a JSON response
    res.json(users);
  } catch (error) {
    // Log error and send an internal server error response if something goes wrong
    console.log("Problem in the get user controller", error.message);
    res.status(500).json({ error: "Internal Server Error get user" });
  }
};

// Get a specific user's profile
export const getUserProfile = async (req, res) => {
  try {
    // Fetch the user by ID from the request parameters
    const user = await User.findById(req.params.id);
    // If the user is not found, return a 404 status with an error message
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Send the user profile as a JSON response
    res.status(200).json(user);
  } catch (err) {
    // Handle errors by sending a 500 status with the error message
    res.status(500).json({ error: err.message });
  }
};

// Follow or unfollow a user
export const followUser = async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID of the user to follow/unfollow from the request parameters
    const userId = req.user._id; // Extract the ID of the currently authenticated user

    // Validate the provided user IDs
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Prevent users from following themselves
    if (id === userId.toString()) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    // Find both the user to follow/unfollow and the current user
    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(userId);

    // If either user is not found, return a 404 status with an error message
    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the current user is already following the target user
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // If already following, perform the unfollow operation
      await User.findByIdAndUpdate(userId, { $pull: { following: id } }); // Remove the target user from current user's following list
      await User.findByIdAndUpdate(id, { $pull: { followers: userId } }); // Remove the current user from target user's followers list

      // //////////////////////////////////////////////////////////////////////
      // Optionally, create an "unfollow" notification (commented out here)
      // await Notification.create({
      //   recipient: id,
      //   sender: userId,
      //   type: 'unfollow',
      //   content: `${currentUser.username} unfollowed you`
      // });
      // ////////////////////////////////////////////////////////////////////////

      // Send a success response for unfollow operation
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // If not following, perform the follow operation
      await User.findByIdAndUpdate(userId, { $push: { following: id } }); // Add the target user to current user's following list
      await User.findByIdAndUpdate(id, { $push: { followers: userId } }); // Add the current user to target user's followers list

      // Create a "follow" notification for the target user
      const notification = await Notification.create({
        recipient: id,
        sender: userId,
        type: "follow",
        content: `${currentUser.username} started following you`,
      });

      sendNotification(id, notification);

      // Check if there is an existing conversation between the two users
      const existingConversation = await Conversation.findOne({
        participants: { $all: [userId, id] },
      });

      if (!existingConversation) {
        // If no conversation exists, create a new conversation
        const newConversation = new Conversation({
          participants: [userId, id],
          messages: [],
        });
        await newConversation.save(); // Save the new conversation to the database
      }

      // Send a success response for follow operation and conversation creation
      res.status(200).json({
        message: "User followed successfully and conversation started",
      });
    }
  } catch (error) {
    // Log error and send an internal server error response if something goes wrong
    console.error("Error in followUser controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user's notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id; // Extract the ID of the currently authenticated user

    // Fetch the user's notifications, sort by creation date (newest first), and populate sender details
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 }) // Sort notifications by creation date in descending order
      .populate("sender", "username profilePic"); // Populate sender details (username and profile picture)

    // Send the list of notifications as a JSON response
    res.status(200).json(notifications);
  } catch (error) {
    // Log error and send an internal server error response if something goes wrong
    console.error("Error in getUserNotifications controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSuggestedUserstoFollow = async (req, res) => {
  try {
    const userId = req.user._id; // Extract the ID of the currently authenticated user
    const user = await User.findById(userId)
      .populate("following") // Populate the 'following' field to get details of users the current user is following
      .populate("clan"); // Populate the 'clan' field to get details of clans the current user belongs to

    // If the user is not found, return a 404 status with an error message
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get IDs of users the current user is already following
    const followingIds = user.following.map((f) => f._id.toString());

    // Get IDs of clans the user belongs to
    const clanIds = user.clan.map((c) => c._id);

    let suggestedUsers;

    // Check if the user has no followers or isn't following anyone
    if (user.followers.length === 0 && user.following.length === 0) {
      // Get three random users
      suggestedUsers = await User.aggregate([
        {
          $match: {
            _id: { $ne: new mongoose.Types.ObjectId(userId) },
          },
        },
        { $sample: { size: 3 } },
        {
          $project: {
            _id: 1,
            username: 1,
            fullName: 1,
            profilePic: 1,
            followersCount: { $size: "$followers" },
          },
        },
      ]);
    } else {
      // Find suggested users to follow based on common connections and common clans
      suggestedUsers = await User.aggregate([
        {
          $match: {
            _id: {
              $ne: new mongoose.Types.ObjectId(userId), // Exclude the current user
              $nin: followingIds.map((id) => new mongoose.Types.ObjectId(id)), // Exclude users already being followed
            },
          },
        },
        {
          $lookup: {
            from: "clans", // Lookup clan details
            localField: "clan",
            foreignField: "_id",
            as: "userClans", // Save the result in 'userClans' field
          },
        },
        {
          $addFields: {
            followersCount: {
              $cond: {
                if: { $isArray: "$followers" }, // Check if 'followers' field is an array
                then: { $size: "$followers" }, // Get the size of the 'followers' array
                else: 0, // If not an array, set the count to 0
              },
            },
            commonConnections: {
              $size: {
                $setIntersection: [
                  { $ifNull: ["$followers", []] }, // Get the followers of the user
                  followingIds.map((id) => new mongoose.Types.ObjectId(id)), // Convert the following IDs to ObjectIds
                ],
              },
            },
            commonClans: {
              $size: {
                $setIntersection: ["$userClans._id", clanIds], // Get the intersection of user clans and current user's clans
              },
            },
          },
        },
        {
          $match: {
            $or: [
              { commonConnections: { $gt: 0 } }, // Include users with common connections
              { commonClans: { $gt: 0 } }, // Include users with common clans
            ],
          },
        },
        {
          $sort: {
            commonConnections: -1, // Sort by common connections in descending order
            commonClans: -1, // Sort by common clans in descending order
            followersCount: -1, // Sort by followers count in descending order
          },
        },
        {
          $limit: 5, // Limit the results to 5 users
        },
        {
          $project: {
            _id: 1, // Include user ID
            username: 1, // Include username
            fullName: 1, // Include full name
            profilePic: 1, // Include profile picture
            followersCount: 1, // Include followers count
            commonConnections: 1, // Include common connections count
            commonClans: 1, // Include common clans count
          },
        },
      ]);
    }

    // Send the list of suggested users as a JSON response
    res.status(200).json(suggestedUsers);
  } catch (error) {
    // Log error and send an internal server error response if something goes wrong
    console.error("Error in getSuggestedUserstoFollow controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user's feed posts
export const getUserFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id; // Extract the ID of the currently authenticated user

    // Parse page and limit from query params, defaulting to 1 and 5 respectively
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit; // Calculate the number of posts to skip for pagination

    // Find the user and populate their following and clan fields
    const user = await User.findById(userId)
      .populate("following", "_id") // Populate 'following' field with user IDs
      .populate("clan", "_id"); // Populate 'clan' field with clan IDs

    // If the user is not found, return a 404 status with an error message
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract IDs of followed users and clans
    const followingIds = user.following.map((f) => f._id);
    const clanIds = user.clan.map((c) => c._id);

    // Aggregate pipeline to fetch and process posts
    const feedPosts = await Post.aggregate([
      // Match posts from followed users, user's own posts, or clan posts
      {
        $match: {
          $or: [
            { user: { $in: [...followingIds, userId] } }, // Include posts from followed users or current user
            { clan: { $in: clanIds } }, // Include posts from user's clans
          ],
        },
      },
      // Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails", // Save user details in 'userDetails' field
        },
      },
      { $unwind: "$userDetails" }, // Unwind the 'userDetails' array to get user details for each post
      // Lookup clan details
      {
        $lookup: {
          from: "clans",
          localField: "clan",
          foreignField: "_id",
          as: "clanDetails", // Save clan details in 'clanDetails' field
        },
      },
      {
        $unwind: {
          path: "$clanDetails",
          preserveNullAndEmptyArrays: true, // Preserve posts that do not belong to any clan
        },
      },
      // Lookup category details
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails", // Save category details in 'categoryDetails' field
        },
      },
      {
        $unwind: {
          path: "$categoryDetails",
          preserveNullAndEmptyArrays: true, // Preserve posts that do not belong to any category
        },
      },
      // Calculate relevance score and determine if it's a clan post
      {
        $addFields: {
          relevanceScore: {
            $add: [
              { $cond: [{ $in: ["$user", followingIds] }, 10, 0] }, // Add score if post is from a followed user
              { $cond: [{ $in: ["$clan", clanIds] }, 15, 0] }, // Add score if post is from a user's clan
              { $divide: [{ $size: "$upVotes" }, 10] }, // Add score based on number of upVotes
              { $divide: [{ $size: "$comments" }, 5] }, // Add score based on number of comments
            ],
          },
          isClanPost: { $cond: [{ $ifNull: ["$clan", false] }, true, false] }, // Determine if the post belongs to a clan
        },
      },
      // Sort posts
      {
        $sort: {
          isClanPost: -1, // Prioritize clan posts over individual posts
          relevanceScore: -1, // Sort by relevance score in descending order
          createdAt: -1, // Sort by creation date in descending order
        },
      },
      // Group by post ID to remove duplicates
      {
        $group: {
          _id: "$_id",
          post: { $first: "$$ROOT" }, // Keep the first occurrence of each post ID
        },
      },
      { $replaceRoot: { newRoot: "$post" } }, // Replace the root document with the post document
      { $skip: skip }, // Skip the number of posts based on pagination
      { $limit: limit }, // Limit the number of posts returned
      // Project only necessary fields
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          photo: 1,
          createdAt: 1,
          upVotes: 1,
          downVotes: 1,
          comments: 1,
          shareCount: 1,
          user: {
            _id: "$userDetails._id",
            username: "$userDetails.username",
            profilePic: "$userDetails.profilePic",
          },
          clan: {
            _id: "$clanDetails._id",
            name: "$clanDetails.name",
          },
          category: {
            _id: "$categoryDetails._id",
            name: "$categoryDetails.name",
          },
          relevanceScore: 1,
          isClanPost: 1,
        },
      },
    ]);

    // Count total posts for pagination
    const totalPosts = await Post.countDocuments({
      $or: [
        { user: { $in: [...followingIds, userId] } }, // Count posts from followed users or current user
        { clan: { $in: clanIds } }, // Count posts from user's clans
      ],
    });

    const totalPages = Math.ceil(totalPosts / limit); // Calculate the total number of pages

    // Send response with posts, current page, total pages, and total posts count
    res.status(200).json({
      posts: feedPosts,
      currentPage: page,
      totalPages: totalPages,
      totalPosts: totalPosts,
    });
  } catch (error) {
    // Log error and send an internal server error response if something goes wrong
    console.error("Error in getUserFeedPosts controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get online friends
export const getOnlineFriends = async (req, res) => {
  try {
    const userId = req.user._id; // Extract the ID of the currently authenticated user
    // Find the user and populate their following list with basic details
    const user = await User.findById(userId).populate(
      "following",
      "_id username fullName profilePic"
    );

    // If the user is not found, return a 404 status with an error message
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filter the list of following users to find online friends using userSocketMap
    const onlineFriends = user.following
      .filter(
        (friend) => userSocketMap[friend._id.toString()] // Check if the friend is online
      )
      .slice(0, 10)
      .map((friend) => ({
        _id: friend._id,
        username: friend.username,
        fullName: friend.fullName,
        profilePic: friend.profilePic,
      }));

    // Send the list of online friends as a JSON response
    res.json(onlineFriends);
  } catch (error) {
    // Log error and send an internal server error response if something goes wrong
    console.log("Problem in the getOnlineFriends controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
