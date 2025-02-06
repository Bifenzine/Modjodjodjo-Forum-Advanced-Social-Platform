import express from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../Middleware/auth.middleware.js";
import {
  createComment,
  deleteComment,
  getCommentsForPost,
  updateComment,
} from "../Controllers/comment.controllers.js";
import {
  createReply,
  deleteReply,
  likeReply,
  updateReply,
} from "../Controllers/reply.controllers.js";
import { cloudinaryUpload } from "../Storage/Cloudinary.config.js";

// multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Comments/Reply");
  },
  filename: function (req, file, cb) {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Get the file extension
    const fileExtension = path.extname(file.originalname);
    // Construct the unique filename
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|webm/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Error: Unsupported file type!");
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
});

// Use local storage for development, Cloudinary for production
const useCloudinary = process.env.NODE_ENV === "production";

// upload photo to cloudinary middleware
const uploadMiddleware = useCloudinary
  ? cloudinaryUpload.single("photo")
  : upload.single("photo");

const router = express.Router();

// Create a repy for a specific comment
// tested : working
router.post(
  "/addReply/:commentId",
  authMiddleware,
  uploadMiddleware,
  createReply
);

// Delete a comment
router.delete("/deleteReply/:replyId", authMiddleware, deleteReply);

// Update a comment
router.patch(
  "/editReply/:replyId",
  authMiddleware,
  uploadMiddleware,
  updateReply
);

// like reply
router.patch("/likeReply/:replyId", authMiddleware, likeReply);

export default router;
