import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js"; // Import the Notification model
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import dotenv from "dotenv";
// cloudinary setup
import { cloudinary } from "../Storage/Cloudinary.config.js";
import { Socket } from "dgram";
import { io, sendNotification } from "../socket/socket.js";

// to delete the images from theserver after deleting the post or updating the post
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirname = path.resolve();
// //////////////////////////////////////////////////////////////

dotenv.config();
// cloudinary trigger in production env
const useCloudinary = process.env.NODE_ENV === "production";

// get post detail
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: "user",
        select: "-password -popularity -gender -createdAt -updatedAt",
      })
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "-password",
        },
      });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId)
      .populate("bookmark")
      .populate({
        path: "followers following",
        select: "-password -gender -createdAt -updatedAt",
      })
      .populate({
        path: "clan",
        select: "",
      });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password -gender -createdAt -updatedAt",
      })
      .populate({
        path: "category",
        select: "",
      })
      .populate({
        path: "clan",
        select: "",
      });

    res.status(200).json({ user, posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPost = async (req, res) => {
  console.log("Starting createPost function");
  console.log("Request body:", req.body);
  console.log("User ID:", req.user?._id);

  const { title, content, category } = req.body;
  const userId = req.user?._id;

  console.log("Checking for file:");
  if (req.file) {
    console.log("File details:", JSON.stringify(req.file, null, 2));
  } else {
    console.log("No file found in request");
  }

  let photo = "";
  if (req.file) {
    console.log("File found, processing path");
    photo = useCloudinary ? req.file.path : req.file.path.replace(/\\/g, "/");
    console.log("Processed photo path:", photo);
  }

  try {
    console.log("Creating new Post object");
    const newPost = new Post({
      user: userId,
      title,
      content,
      category,
      photo,
      comments: [],
    });
    console.log("New post object:", newPost);

    console.log("Saving post to database");
    const post = await newPost.save();
    console.log("Post saved successfully:", post);

    // Create notifications for followers
    // const followers = await User.find({ following: userId });
    // console.log("Followers found:", followers.length);

    // const notifications = followers.map((follower) => ({
    //   recipient: follower._id,
    //   sender: userId,
    //   type: "new_post",
    //   post: post._id,
    //   content: `${req.user.username} created a new post`,
    // }));

    // console.log("Sending notifications");
    // notifications.forEach((notification) => {
    //   sendNotification(notification.recipient, notification);
    // });

    res.status(201).json(post);
  } catch (error) {
    console.error("Error in create post controller", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const allPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("user category");
    res.json(posts);
  } catch (error) {
    console.error("Error in all posts controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const NewestPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error in all posts controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Delete the post's photo from the server /////////////////////////////////
    // if (post.photo) {
    //   const photoPath = path.join(__dirname, "..", post.photo);
    //   try {
    //     await fs.unlink(photoPath);
    //   } catch (err) {
    //     console.error("Error deleting post's photo:", err);
    //   }
    // }
    ////////////////////////////////////////////////////////////////////////

    // new config for cloudinary in production and multer locaalstorage for developpment
    if (post.photo && useCloudinary) {
      try {
        // Extract public_id directly from the URL
        const regex = /\/modjo\/([^/]+)\.\w+$/;
        const match = post.photo.match(regex);
        if (match && match[1]) {
          const public_id = `modjo/${match[1]}`;
          console.log("Attempting to delete image with public_id:", public_id);
          // Determine resource type based on URL or file extension
          const isVideo =
            post.photo.includes("/video/upload/") ||
            ["mp4", "webm"]?.includes(match[2]?.toLowerCase());

          console.log(
            `Attempting to delete ${
              isVideo ? "video" : "image"
            } with public_id:`,
            public_id
          );
          const result = await cloudinary.uploader.destroy(public_id, {
            resource_type: isVideo ? "video" : "image",
          });
          console.log("Cloudinary deletion result:", result);
        } else {
          console.error("Could not extract public_id from URL:", post.photo);
        }
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
      }
    } else if (post.photo) {
      // Local file deletion logic
      const photoPath = path.join(__dirname, "..", post.photo);
      await fs.unlink(photoPath);
    }

    ////////////////////////////////////////////////////////////////////

    const deletedPost = await Post.findByIdAndDelete(postId);
    res.json(deletedPost);
  } catch (error) {
    console.error("Error in delete post controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updatePost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Only delete existing photo if we're either uploading a new one or explicitly deleting it
    if (post.photo && (req.file || req.body.deletePhoto === "true")) {
      if (useCloudinary) {
        try {
          // Extract public_id directly from the URL
          const regex = /\/modjo\/([^/]+)\.\w+$/;
          const match = post.photo.match(regex);
          if (match && match[1]) {
            const public_id = `modjo/${match[1]}`;
            console.log(
              "Attempting to delete image with public_id:",
              public_id
            );

            // Determine resource type based on URL or file extension
            const isVideo =
              post.photo.includes("/video/upload/") ||
              ["mp4", "webm"]?.includes(match[2]?.toLowerCase());

            console.log(
              `Attempting to delete ${
                isVideo ? "video" : "image"
              } with public_id:`,
              public_id
            );

            const result = await cloudinary.uploader.destroy(public_id, {
              resource_type: isVideo ? "video" : "image",
            });
            console.log("Cloudinary deletion result:", result);
          } else {
            console.error("Could not extract public_id from URL:", post.photo);
          }
        } catch (cloudinaryError) {
          console.error(
            "Error deleting image from Cloudinary:",
            cloudinaryError
          );
          // Continue with the update even if image deletion fails
        }
      } else {
        try {
          const photoPath = path.join(__dirname, "..", post.photo);
          await fs.unlink(photoPath);
        } catch (unlinkError) {
          console.error("Error deleting local file:", unlinkError);
          // Continue with the update even if image deletion fails
        }
      }
    }

    // Handle photo update
    if (req.file) {
      // New photo uploaded
      if (useCloudinary) {
        post.photo = req.file.path; // Cloudinary URL
      } else {
        post.photo = req.file.path.replace(/\\/g, "/");
      }
    } else if (req.body.deletePhoto === "true") {
      // Explicitly delete photo
      post.photo = null;
    } else if (req.body.keepExistingPhoto === "true") {
      // Keep existing photo - do nothing to post.photo
    }

    // Update other fields
    if (req.body.title) post.title = req.body.title;
    if (req.body.content) post.content = req.body.content;
    if (req.body.category) post.category = req.body.category;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    console.error("Error in update post controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const upvotePost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const alreadyUpvoted = post.upVotes.includes(userId);

    if (alreadyUpvoted) {
      post.upVotes.pull(userId);
    } else {
      post.upVotes.push(userId);

      if (post.downVotes.includes(userId)) {
        post.downVotes.pull(userId);
      }

      // Create notification for post author if it's not their own post
      if (post.user.toString() !== userId.toString()) {
        const notification = await Notification.create({
          recipient: post.user,
          sender: userId,
          type: "post_upvote",
          post: post._id,
          content: `${req.user.username} upvoted your post`,
        });

        sendNotification(post.user, notification);
      }
    }

    await post.save();

    // Emit socket event for upvote
    io.emit("postUpvoted", {
      postId: post._id,
      upVotes: post.upVotes,
      downVotes: post.downVotes,
    });

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in upvote post controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const downvotePost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const alreadyDownvoted = post.downVotes.includes(userId);

    if (alreadyDownvoted) {
      post.downVotes.pull(userId);
    } else {
      post.downVotes.push(userId);

      if (post.upVotes.includes(userId)) {
        post.upVotes.pull(userId);
      }

      // Create notification for post author if it's not their own post
      if (post.user.toString() !== userId.toString()) {
        const notification = await Notification.create({
          recipient: post.user,
          sender: userId,
          type: "post_downvote",
          post: post._id,
          content: `${req.user.username} downvoted your post`,
        });

        sendNotification(post.user, notification);
      }
    }

    await post.save();

    // Emit socket event for downvote
    io.emit("postDownvoted", {
      postId: post._id,
      upVotes: post.upVotes,
      downVotes: post.downVotes,
    });

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in downvote post controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sharePostCount = async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Increment the shareCount
    post.shareCount += 1;

    // Save the updated post
    await post.save();

    // Emit socket event for share
    io.emit("postShared", { postId: post._id, shareCount: post.shareCount });

    res.status(200).json({
      message: "Post shared successfully",
      shareCount: post.shareCount,
    });
  } catch (error) {
    console.error("Error in share post controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSuggestedPosts = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user ? req.user._id : null;
    const limit = 6; // Fixed limit of 6 suggested posts

    // Get the current post
    const currentPost = await Post.findById(postId).populate("category");
    if (!currentPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Build the suggestion query
    let suggestionQuery = {
      _id: { $ne: postId }, // Exclude the current post
    };

    if (userId) {
      // Exclude posts by the current user
      suggestionQuery.user = { $ne: userId };
    }

    let currentUser = null;
    if (userId) {
      currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // If the user is part of clans, include posts from those clans
      if (currentUser.clan && currentUser.clan.length > 0) {
        suggestionQuery.$or = [
          { clan: { $in: currentUser.clan } },
          { clan: { $exists: false } },
        ];
      }
    }

    // If the post has a category, prioritize posts from the same category
    if (currentPost.category) {
      suggestionQuery.category = currentPost.category._id;
    }

    // Find suggested posts
    let suggestedPosts = await Post.find(suggestionQuery)
      .populate("user", "username profilePic")
      .populate("category")
      .sort({ createdAt: -1, upVotes: -1 }) // Sort by newest and most upvoted
      .limit(limit);

    // If we don't have enough suggestions, fetch more posts without category restriction
    if (suggestedPosts.length < limit) {
      const remainingLimit = limit - suggestedPosts.length;
      const additionalQuery = {
        _id: { $ne: postId },
        _id: { $nin: suggestedPosts.map((post) => post._id) },
      };
      if (userId) {
        additionalQuery.user = { $ne: userId };
      }
      const additionalPosts = await Post.find(additionalQuery)
        .populate("user", "username profilePic")
        .populate("category")
        .sort({ createdAt: -1, upVotes: -1 })
        .limit(remainingLimit);

      suggestedPosts = [...suggestedPosts, ...additionalPosts];
    }

    // Calculate engagement score for each post
    suggestedPosts = suggestedPosts.map((post) => {
      const engagementScore =
        post.upVotes.length * 2 + // Upvotes have more weight
        post.downVotes.length * -1 + // Downvotes reduce score
        post.comments.length * 1.5 + // Comments are valuable
        post.shareCount * 3; // Shares are most valuable

      return {
        ...post.toObject(),
        engagementScore,
      };
    });

    // Sort by engagement score
    suggestedPosts.sort((a, b) => b.engagementScore - a.engagementScore);

    res.status(200).json(suggestedPosts);
  } catch (error) {
    console.error("Error in getSuggestedPosts:", error);
    res.status(500).json({
      message: "Error fetching suggested posts",
      error: error.message,
    });
  }
};
