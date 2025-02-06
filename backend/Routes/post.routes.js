import express from "express";
import multer from "multer";
import path from "path";
import {
  NewestPosts,
  allPosts,
  createPost,
  deletePost,
  downvotePost,
  getPost,
  getSuggestedPosts,
  getUserPosts,
  sharePostCount,
  updatePost,
  upvotePost,
} from "../Controllers/post.controllers.js";
import { authMiddleware } from "../Middleware/auth.middleware.js";
import { cloudinaryUpload } from "../Storage/Cloudinary.config.js";

// Multer configuration for local storage (keep this as it was)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
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

const router = express.Router();

// Use local storage for development, Cloudinary for production
const useCloudinary = process.env.NODE_ENV === "production";
console.log(
  "Upload Middleware:",
  useCloudinary ? "Cloudinary" : "Local Storage"
);

// upload photo to cloudinary middleware
const uploadMiddleware = useCloudinary
  ? cloudinaryUpload.single("photo")
  : upload.single("photo");

// Routes
router.post("/createPost", authMiddleware, uploadMiddleware, createPost);

router.patch(
  "/updatePost/:postId",
  authMiddleware,
  uploadMiddleware,
  updatePost
);

// Other routes remain the same
router.get("/AllPosts", allPosts);
router.get("/post/:id", getPost);
router.get("/newPosts", NewestPosts);
router.get("/suggestedPosts/:postId", getSuggestedPosts);
router.delete("/deletePost/:postId", authMiddleware, deletePost);
router.get("/user/posts/:id", getUserPosts);
router.patch("/post/upvote/:postId", authMiddleware, upvotePost);
router.patch("/post/downvote/:postId", authMiddleware, downvotePost);
router.patch("/post/share/:postId", sharePostCount);

export default router;
