import express from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../Middleware/auth.middleware.js";
import {
  deleteProfile,
  editProfile,
} from "../Controllers/loggedUser.controllers.js";
import { cloudinaryUpload } from "../Storage/Cloudinary.config.js";

// multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/profilePics");
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

// Initialize multer with the storage configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
});

const useCloudinary = process.env.NODE_ENV === "production";

// upload photo to cloudinary middleware
const uploadMiddleware = useCloudinary
  ? cloudinaryUpload.single("profilePic")
  : upload.single("profilePic");

const router = express.Router();

//tested :working
router.patch("/edit", authMiddleware, uploadMiddleware, editProfile);
//tested :ongoing
router.delete("/delete", authMiddleware, deleteProfile);

export default router;
