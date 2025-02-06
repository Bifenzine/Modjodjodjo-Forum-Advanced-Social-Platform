import express from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../Middleware/auth.middleware.js";
import {
  changeRoleToAdmin,
  changeRoleToMember,
  changeRoleToModerator,
  createClan,
  createPostInClan,
  deleteClan,
  deleteClanPost,
  editClan,
  getAllTimeClansRanking,
  getClan,
  getClans,
  getClansByCategory,
  getClansByUserId,
  getMonthlyClansRanking,
  getNewestPostsInClan,
  getPopularPostsInClan,
  getTrendingPostsInClan,
  getWeeklyClansRanking,
  joinClan,
  removeMemberFromClan,
  updateAdminStatus,
  updateClanPost,
} from "../Controllers/clans.controllers.js";
import { cloudinaryUpload } from "../Storage/Cloudinary.config.js";

// multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Clan");
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

// get clan by id

router.get("/info/:ClanId", getClan);

// get All clans
router.get("/All", getClans);

// create clan
// tested : working
router.post("/create", authMiddleware, uploadMiddleware, createClan);

// create Post to clan
// tested : working
router.post(
  "/createPost/:ClanId",
  authMiddleware,
  uploadMiddleware,
  createPostInClan
);

// update clan post
// tested : working
router.patch(
  "/updatePost/:postId",
  authMiddleware,
  uploadMiddleware,
  updateClanPost
);

// delete clan post
// tested : working
router.delete("/deletePost/:postId", authMiddleware, deleteClanPost);

// delete clan
// tested : working
router.delete("/delete/:ClanId", authMiddleware, deleteClan);

// Update a clan
// tested : working but image is not updating correctly we can change image but not delete it
router.patch("/edit/:ClanId", authMiddleware, uploadMiddleware, editClan);

// add member to clan
// tested : working
router.patch("/joinClan/:ClanId", authMiddleware, joinClan);

// add admin to clan
// tested : working
router.patch("/updateAdminStatus/:ClanId", authMiddleware, updateAdminStatus);

// get clan by category
router.get("/category/:categoryId", getClansByCategory);

// get Tending posts
router.get("/posts/trending/:ClanId", getTrendingPostsInClan);

// get popular posts in the clan
router.get("/posts/popular/:ClanId", getPopularPostsInClan);

// get newest posts in the clan
router.get("/posts/newest/:ClanId", getNewestPostsInClan);

// get weekly clans ranking
router.get("/ranking/weekly", getWeeklyClansRanking);

// get monthly clans ranking
router.get("/ranking/monthly", getMonthlyClansRanking);

// get all the time clans ranking
router.get("/ranking/allTime", getAllTimeClansRanking);

// role managment changeAdminToMember
// tested : workingrouter.delete("/removeAdmin/:ClanId/:userId", authMiddleware, removeAdminFromClan);

// Change role to admin
// tested : working
router.patch(
  "/changeRoleToAdmin/:ClanId/:userId",
  authMiddleware,
  changeRoleToAdmin
);

// changeRoleToMember
// tested : working
router.patch(
  "/changeRoleToMember/:ClanId/:userId",
  authMiddleware,
  changeRoleToMember
);

// Change role to moderator
// tested : working
router.patch(
  "/changeRoleToModerator/:ClanId/:userId",
  authMiddleware,
  changeRoleToModerator
);

//  remove member from clan
// tested : working
router.delete(
  "/removeMember/:ClanId/:userId",
  authMiddleware,
  removeMemberFromClan
);

// tested : working
router.get("/user/:userId", getClansByUserId);

export default router;
