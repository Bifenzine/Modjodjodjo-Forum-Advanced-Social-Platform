import express from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../Middleware/auth.middleware.js";
import {
  createComment,
  deleteComment,
  getCommentsForPost,
  likeComment,
  updateComment,
} from "../Controllers/comment.controllers.js";
import { cloudinaryUpload } from "../Storage/Cloudinary.config.js";

// multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Comments");
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

// Get all comments for a specific post
router.get("/CommentsPost/:postId", getCommentsForPost); // Change route path to include postId

// Create a comment for a specific post
// tested : working
router.post("/:postId", authMiddleware, uploadMiddleware, createComment);

// Delete a comment
// tested : working
router.delete("/:commentId", authMiddleware, deleteComment);

// Update a comment
// tested : working but image is not updating correctly we can change image but not delete it
router.patch("/:commentId", authMiddleware, uploadMiddleware, updateComment);

// like comment
// tested : working
router.patch("/likeComment/:commentId", authMiddleware, likeComment);

export default router;
