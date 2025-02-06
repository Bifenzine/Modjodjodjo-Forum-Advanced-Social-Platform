import Reply from "../models/reply.model.js";
import Comment from "../models/comment.model.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { cloudinary } from "../Storage/Cloudinary.config.js";

dotenv.config();
// cloudinary trigger in production env
const useCloudinary = process.env.NODE_ENV === "production";

export const createReply = async (req, res) => {
  const { content = "" } = req.body;
  const { commentId } = req.params;

  // config for multer local storage
  // let photo = "";

  // // Check if a photo file was uploaded
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
    const replyData = {
      user: userId,
      content: content,
      photo: photo,
      comment: commentId, // Set the comment field using the associated comment ID
    };

    const newReply = new Reply(replyData);
    const reply = await newReply.save();

    // Update associated comment document with the new reply's ID
    await Comment.findByIdAndUpdate(commentId, {
      $push: { replies: reply._id },
    });

    res.status(201).json(reply);
  } catch (error) {
    console.error("Error in create reply controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteReply = async (req, res) => {
  const replyId = req.params.replyId;

  try {
    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    // Find the associated comment
    const comment = await Comment.findById(reply.comment);

    if (!comment) {
      return res.status(404).json({ error: "Associated comment not found" });
    }

    // Check if the user is the author of the reply
    if (reply.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // config for cloudinary storage in prod and multer for dev env
    if (reply.photo) {
      if (useCloudinary) {
        try {
          // Extract public_id directly from the URL
          const regex = /\/modjo\/([^/]+)\.\w+$/;
          const match = reply.photo.match(regex);
          if (match && match[1]) {
            const public_id = `modjo/${match[1]}`;
            console.log(
              "Attempting to delete reply image in delete controller with public_id:",
              public_id
            );
            const isVideo =
              reply.photo.includes("/video/upload/") ||
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
            console.log("Cloudinary reply image deletion result:", result);
          }
        } catch (err) {
          console.error("Error deleting reply's photo:", err);
        }
      } else {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const photoPath = path.join(__dirname, "..", reply.photo);
        try {
          await fs.unlink(photoPath);
        } catch (err) {
          console.error("Error deleting reply's photo:", err);
        }
      }
    }

    // Delete the reply's photo if it exists
    // if (reply.photo) {
    //   const __filename = fileURLToPath(import.meta.url);
    //   const __dirname = path.dirname(__filename);
    //   const photoPath = path.join(__dirname, "..", reply.photo);
    //   try {
    //     await fs.unlink(photoPath);
    //   } catch (err) {
    //     console.error("Error deleting reply's photo:", err);
    //   }
    // }

    // Delete the reply
    await Reply.findByIdAndDelete(replyId);

    // Remove the reply ID from the associated comment's replies array
    comment.replies.pull(replyId);
    await comment.save();

    res.json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error("Error in delete reply controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const updateReply = async (req, res) => {
  const replyId = req.params.replyId;

  try {
    const reply = await Reply.findById(replyId);

    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    // Check if the user is the author of the reply
    if (reply.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Delete the existing photo if it exists multer for dev env
    // if (reply.photo) {
    //   const __filename = fileURLToPath(import.meta.url);
    //   const __dirname = path.dirname(__filename);
    //   const photoPath = path.join(__dirname, "..", reply.photo);
    //   try {
    //     await fs.unlink(photoPath);
    //   } catch (err) {
    //     console.error("Error deleting old photo:", err);
    //   }
    // }
    // Update the reply
    // const updateReplyData = { ...req.body };

    // // If a new file is provided, update the photo field
    // if (req.file) {
    //   const filePath = req.file.path.replace(/\\\\/g, "/");
    //   updateReplyData.photo = filePath;
    // } else {
    //   updateReplyData.photo = "";
    // }
    // Update the reply
    const updateReplyData = { ...req.body };

    // config for cloudinary storage in prod and multer for dev env
    if (reply.photo) {
      if (useCloudinary) {
        try {
          // Extract public_id directly from the URL
          const regex = /\/modjo\/([^/]+)\.\w+$/;
          const match = reply.photo.match(regex);
          if (match && match[1]) {
            const public_id = `modjo/${match[1]}`;
            console.log(
              "Attempting to delete reply image in update controller with public_id:",
              public_id
            );
            const isVideo =
              reply.photo.includes("/video/upload/") ||
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
            console.log("Cloudinary reply image deletion result:", result);
          }
        } catch (err) {
          console.error("Error deleting old photo:", err);
        }
      } else {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const photoPath = path.join(__dirname, "..", reply.photo);
        try {
          await fs.unlink(photoPath);
        } catch (err) {
          console.error("Error deleting old photo:", err);
        }
      }
      // Update the reply
      updateReplyData.photo = "";
    }

    // If a new file is provided, update the photo field
    if (req.file) {
      console.log("New file detected:", req.file);
      if (useCloudinary) {
        updateReplyData.photo = req.file.path; // This should be the Cloudinary URL
      } else {
        // For local storage, we need to update the path
        updateReplyData.photo = req.file.path.replace(/\\/g, "/");
      }
      console.log("New image path:", updateReplyData.photo);
    }

    // Update the reply with the new data
    const updatedReply = await Reply.findByIdAndUpdate(
      replyId,
      updateReplyData,
      { new: true }
    );

    // Find the associated comment and update its replies array
    const comment = await Comment.findById(reply.comment);
    if (comment) {
      const replyIndex = comment.replies.indexOf(replyId);
      if (replyIndex !== -1) {
        comment.replies.set(replyIndex, updatedReply._id);
        await comment.save();
      }
    }

    res.json(updatedReply);
  } catch (error) {
    console.error("Error in update reply controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const likeReply = async (req, res) => {
  const replyId = req.params.replyId;
  const userId = req.user._id;

  try {
    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    // Check if the user has already liked the reply
    const isLiked = reply.likes.includes(userId);

    // Toggle like/unlike
    if (isLiked) {
      // Remove the user's ID from the likes array
      reply.likes.pull(userId);
    } else {
      // Add the user's ID to the likes array
      reply.likes.push(userId);
    }

    await reply.save();

    res.json(reply);
  } catch (error) {
    console.error("Error in like reply controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
