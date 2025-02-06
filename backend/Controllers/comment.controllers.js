import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { cloudinary } from "../Storage/Cloudinary.config.js";
import { sendNotification } from "../socket/socket.js";

const dirname = path.resolve();

dotenv.config();
// cloudinary trigger in production env
const useCloudinary = process.env.NODE_ENV === "production";

export const getCommentsForPost = async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(400).json({ error: "postId is required" });
  }

  try {
    const comments = await Comment.find({ post: postId })
      .populate({
        path: "user",
        select: "-password -popularity -gender -createdAt -updatedAt",
      })
      .populate({
        path: "replies",
        populate: {
          path: "user",
          select: "-password -popularity -gender -createdAt -updatedAt",
        },
      })
      .select("-createdAt -updatedAt");

    res.json(comments);
  } catch (error) {
    console.error("Error in get comments for post controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createComment = async (req, res) => {
  const { content = "" } = req.body;
  const { postId } = req.params;

  // config for multer local storage
  // let photo = "";

  // if (req.file && req.file.path) {
  //   photo = req.file.path.replace(/\\\\/g, "/");
  // }

  // new config for cloudinary storage in prod and multer for dev env
  let photo = "";
  if (req.file && req.file.path) {
    photo = useCloudinary ? req.file.path.replace(/\\/g, "/") : req.file.path;
  }

  const userId = req.user._id;

  try {
    const commentData = {
      user: userId,
      post: postId,
    };

    if (content) {
      commentData.content = content;
    }

    if (photo) {
      commentData.photo = photo;
    }

    const newComment = new Comment(commentData);
    const comment = await newComment.save();

    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

    // Find the post to get the author's ID
    const post = await Post.findById(postId);

    // Create a notification for the post author if it's not their own comment
    if (post.user.toString() !== userId.toString()) {
      const notification = await Notification.create({
        recipient: post.user,
        sender: userId,
        type: "comment",
        post: postId,
        comment: comment._id,
        content: `${req.user.username} commented on your post`,
      });

      sendNotification(post.user, notification);
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error in create comment controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteComment = async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user._id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // config for cloudinary storage in prod and multer for dev env
    if (comment.photo) {
      if (useCloudinary) {
        try {
          // Extract public_id directly from the URL
          const regex = /\/modjo\/([^/]+)\.\w+$/;
          const match = comment.photo.match(regex);
          if (match && match[1]) {
            const public_id = `modjo/${match[1]}`;
            console.log(
              "Attempting to delete comment image with public_id:",
              public_id
            );
            const isVideo =
              comment.photo.includes("/video/upload/") ||
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
            console.log("Cloudinary comment image deletion result:", result);
          } else {
            console.error(
              "Could not extract public_id from comment image URL:",
              comment.photo
            );
          }
        } catch (cloudinaryError) {
          console.error(
            "Error deleting banner image from Cloudinary:",
            cloudinaryError
          );
        }
      } else {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const photoPath = path.join(__dirname, "..", comment.photo);
        try {
          await fs.unlink(photoPath);
        } catch (err) {
          console.error("Error deleting comment's photo:", err);
        }
      }
    }

    // if (comment.photo) {
    //   const __filename = fileURLToPath(import.meta.url);
    //   const __dirname = path.dirname(__filename);
    //   const photoPath = path.join(__dirname, "..", comment.photo);
    //   try {
    //     await fs.unlink(photoPath);
    //   } catch (err) {
    //     console.error("Error deleting comment's photo:", err);
    //   }
    // }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });

    res.json(deletedComment);
  } catch (error) {
    console.error("Error in delete comment controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateComment = async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user._id;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updateCommentData = { ...req.body };

    // config for cloudinary storage in prod and multer for dev env
    if (comment.photo) {
      if (useCloudinary) {
        try {
          // Extract public_id directly from the URL
          const regex = /\/modjo\/([^/]+)\.\w+$/;
          const match = comment.photo.match(regex);
          if (match && match[1]) {
            const public_id = `modjo/${match[1]}`;
            console.log(
              "Attempting to delete comment image in update controller with public_id:",
              public_id
            );
            const isVideo =
              comment.photo.includes("/video/upload/") ||
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
            console.log(
              "Cloudinary comment image deletion in update controller result:",
              result
            );
          } else {
            console.error(
              "Could not extract public_id from comment image URL in update controller:",
              comment.photo
            );
          }
        } catch (cloudinaryError) {
          console.error(
            "Error deleting banner image from Cloudinary in update controller:",
            cloudinaryError
          );
        }
      } else {
        const photoPath = comment.photo;
        try {
          await fs.unlink(photoPath);
        } catch (err) {
          console.error("Error deleting old photo:", err);
        }
      }
      updateCommentData.photo = "";
    }

    if (req.file) {
      console.log("New file detected:", req.file);
      if (useCloudinary) {
        updateCommentData.photo = req.file.path; // This should be the Cloudinary URL
      } else {
        // For local storage, we need to update the path
        updateCommentData.photo = req.file.path.replace(/\\/g, "/");
      }
      console.log("New image path:", updateCommentData.photo);
    }

    // config only for multer localstorage
    // if (comment.photo) {
    //   const photoPath = comment.photo;
    //   try {
    //     await fs.unlink(photoPath);
    //   } catch (err) {
    //     console.error("Error deleting old photo:", err);
    //   }
    // }

    // if (!req.file) {
    //   updateCommentData.photo = "";
    // } else {
    //   const filePath = req.file.path.replace(/\\/g, "/");
    //   updateCommentData.photo = filePath;
    // }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      updateCommentData,
      {
        new: true,
      }
    );

    res.json(updatedComment);
  } catch (error) {
    console.error("Error in update comment controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const likeComment = async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user._id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);

      // Create a notification for the comment author if it's not their own like
      if (comment.user.toString() !== userId.toString()) {
        const notification = await Notification.create({
          recipient: comment.user,
          sender: userId,
          type: "comment_like",
          post: comment.post,
          comment: comment._id,
          content: `${req.user.username} liked your comment`,
        });
        sendNotification(comment.user, notification);
      }
    }

    await comment.save();

    res.json(comment);
  } catch (error) {
    console.error("Error in like comment controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
