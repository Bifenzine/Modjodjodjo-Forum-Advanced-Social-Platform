import express from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../Middleware/auth.middleware.js";
import {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  createClanMessage,
  getClanMessages,
  deleteClanMessage,
  getUserClanChats,
  updateClanMessage,
  markClanMessagesSeen,
} from "../Controllers/message.controllers.js";
import { cloudinaryUpload } from "../Storage/Cloudinary.config.js";

const router = express.Router();

// multer config for message images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Messages");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
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
  ? cloudinaryUpload.single("image")
  : upload.single("image");

// tested : working in postman
router.post("/send/:receiverId", authMiddleware, uploadMiddleware, sendMessage);

// tested : working in postman
router.get("/conversation/:conversationId", authMiddleware, getMessages);

// tested : working in postman but image is not updated
router.patch("/:messageId", authMiddleware, uploadMiddleware, updateMessage);

// tested : working in postman
router.delete("/:messageId", authMiddleware, deleteMessage);

// tested : working in postman
// get the clanChats of the clans that the user is part of
router.get("/Clans", authMiddleware, getUserClanChats);

// tested : working in postman
// get all messages of a clan
router.get("/Clans/:ClanId/messages", authMiddleware, getClanMessages);

// tested : working in postman
// send a message to a clan with image to the clan chat
router.post(
  "/Clans/:ClanId/messages",
  authMiddleware,
  uploadMiddleware,
  createClanMessage
);

// tested : working in postman
router.delete(
  "/Clans/:ClanId/messages/:MessageId",
  authMiddleware,
  deleteClanMessage
);

router.patch(
  "/Clans/:ClanId/messages/:MessageId",
  authMiddleware,
  uploadMiddleware,
  updateClanMessage
);

router.patch(
  "/Clans/:clanId/markClanMessagesAsRead",
  authMiddleware,
  markClanMessagesSeen
);

export default router;
