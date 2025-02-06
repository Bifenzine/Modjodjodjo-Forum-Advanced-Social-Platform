import Clan from "../models/clan.model.js";
import User from "../models/user.model.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Post from "../models/post.model.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { cloudinary } from "../Storage/Cloudinary.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirname = path.resolve();

dotenv.config();
// cloudinary trigger in production env
const useCloudinary = process.env.NODE_ENV === "production";

export const getClans = async (req, res) => {
  try {
    const clans = await Clan.find()
      .populate("admins", "username")
      .populate("members", "username")
      .populate("posts", "title")
      .populate("clanCategory", "name");

    res.json(clans);
  } catch (error) {
    console.error("Error in getClans controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getClan = async (req, res) => {
  const { ClanId } = req.params;
  try {
    const clan = await Clan.findById(ClanId)
      .populate("admins", "username")
      .populate("members", "username")
      .populate("posts", "title")
      .populate("moderators", "username profilePic")
      .populate("clanCategory", "name");

    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    res.json(clan);
  } catch (error) {
    console.error("Error in getClan controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getClansByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // check if user is a member or moderator or admin in a clan to see if he belong to a clan
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const clans = await Clan.find({
      $or: [{ members: userId }, { moderators: userId }, { admins: userId }],
    })
      .populate("admins", "username")
      .populate("members", "username")
      .populate("posts", "title")
      .populate("moderators", "username profilePic")
      .populate("clanCategory", "name");

    res.json(clans);
  } catch (error) {
    console.error("Error in getClansByUserId controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createClan = async (req, res) => {
  const { name, description, clanCategory } = req.body;

  // let bannerImage = "";
  // if (req.file && req.file.path) {
  //   bannerImage = req.file.path.replace(/\\\\/g, "/");
  // }

  // new config for cloudinary
  let bannerImage = "";
  if (req.file && req.file.path) {
    bannerImage = useCloudinary
      ? req.file.path
      : req.file.path.replace(/\\/g, "/");
  }

  const adminId = req.user._id;

  try {
    const newClan = new Clan({
      name,
      description,
      admins: [adminId],
      bannerImage,
      members: [adminId],
      clanCategory,
    });

    const clan = await newClan.save();

    // Update the user's document by pushing the new clan ID to their 'clan' array
    await User.findByIdAndUpdate(adminId, { $push: { clan: clan._id } });

    res.status(201).json(clan);
  } catch (error) {
    console.error("Error in createClan controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteClan = async (req, res) => {
  const { ClanId } = req.params;
  const userId = req.user._id;

  try {
    const clan = await Clan.findById(ClanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    if (!clan.admins.includes(userId)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // config for multer localstorage
    // if (clan.bannerImage) {
    //   const bannerImagePath = path.join(dirname, clan.bannerImage);
    //   try {
    //     await fs.unlink(bannerImagePath);
    //   } catch (err) {
    //     console.error("Error deleting clan's banner image:", err);
    //   }
    // }

    // new config for cloudinary and multer localstorage
    if (clan.bannerImage) {
      if (useCloudinary) {
        try {
          // Extract public_id directly from the URL
          const regex = /\/modjo\/([^/]+)\.\w+$/;
          const match = clan.bannerImage.match(regex);
          if (match && match[1]) {
            const public_id = `modjo/${match[1]}`;
            console.log(
              "Attempting to delete banner clan image with public_id:",
              public_id
            );
            const isVideo =
              clan.bannerImage.includes("/video/upload/") ||
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
            console.log("Cloudinary banner image deletion result:", result);
          } else {
            console.error(
              "Could not extract public_id from banner image URL:",
              clan.bannerImage
            );
          }
        } catch (cloudinaryError) {
          console.error(
            "Error deleting banner image from Cloudinary:",
            cloudinaryError
          );
        }
      } else {
        const bannerImagePath = path.join(dirname, clan.bannerImage);
        try {
          await fs.unlink(bannerImagePath);
        } catch (err) {
          console.error("Error deleting clan's banner image:", err);
        }
      }
    }

    // Delete all posts associated with the clan
    await Post.deleteMany({ clan: ClanId });

    // Delete the clan itself
    await Clan.findByIdAndDelete(ClanId);

    res.json({ message: "Clan deleted successfully" });
  } catch (error) {
    console.error("Error in deleteClan controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const editClan = async (req, res) => {
  const { ClanId } = req.params;
  const userId = req.user._id;
  const { imageDeleted } = req.body;

  try {
    const clan = await Clan.findById(ClanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    if (!clan.admins.includes(userId)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updatedData = { ...req.body };

    // if (imageDeleted === "true") {
    //   if (clan.bannerImage) {
    //     const bannerImagePath = path.join(__dirname, "..", clan.bannerImage);
    //     try {
    //       await fs.unlink(bannerImagePath);
    //     } catch (err) {
    //       console.error("Error deleting old banner image:", err);
    //     }
    //   }
    //   updatedData.bannerImage = ""; // Clear the image path
    // } else if (req.file && req.file.path) {
    //   if (clan.bannerImage) {
    //     const bannerImagePath = path.join(__dirname, "..", clan.bannerImage);
    //     try {
    //       await fs.unlink(bannerImagePath);
    //     } catch (err) {
    //       console.error("Error deleting old banner image:", err);
    //     }
    //   }
    //   updatedData.bannerImage = req.file.path.replace(/\\\\/g, "/");
    // }

    // new config for cloudinary and multer localstorage
    // Handle image deletion
    if (imageDeleted === "true" && clan.bannerImage) {
      if (useCloudinary) {
        try {
          const regex = /\/modjo\/([^/]+)\.\w+$/;
          const match = clan.bannerImage.match(regex);
          if (match && match[1]) {
            const public_id = `modjo/${match[1]}`;
            console.log(
              "Attempting to delete banner clan image with public_id:",
              public_id
            );
            const isVideo =
              clan.bannerImage.includes("/video/upload/") ||
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
            console.log("Cloudinary banner image deletion result:", result);
          } else {
            console.error(
              "Could not extract public_id from banner image URL:",
              clan.bannerImage
            );
          }
        } catch (cloudinaryError) {
          console.error(
            "Error deleting banner image from Cloudinary:",
            cloudinaryError
          );
        }
      } else {
        // Local storage deletion
        const bannerImagePath = path.join(process.cwd(), clan.bannerImage);
        try {
          await fs.unlink(bannerImagePath);
          console.log("Local banner image deleted:", bannerImagePath);
        } catch (err) {
          console.error("Error deleting local banner image:", err);
        }
      }
      updatedData.bannerImage = ""; // Clear the image path
    }

    // Handle new image upload
    if (req.file) {
      console.log("New file detected:", req.file);
      if (useCloudinary) {
        updatedData.bannerImage = req.file.path; // This should be the Cloudinary URL
      } else {
        // For local storage, we need to update the path
        updatedData.bannerImage = req.file.path.replace(/\\/g, "/");
      }
      console.log("New image path:", updatedData.bannerImage);
    }

    console.log("Updated data before saving:", updatedData);

    const updatedClan = await Clan.findByIdAndUpdate(ClanId, updatedData, {
      new: true,
    });

    res.json(updatedClan);
  } catch (error) {
    console.error("Error in editClan controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller to add a member to a clan
export const joinClan = async (req, res) => {
  const { ClanId } = req.params;
  const userId = req.user._id;

  try {
    const clan = await Clan.findById(ClanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    const isMember = clan.members.includes(userId);
    const isAdmin = clan.admins.includes(userId);

    if (isMember || isAdmin) {
      // Remove the user from the clan
      await Clan.findByIdAndUpdate(ClanId, {
        $pull: {
          members: userId,
          admins: userId,
        },
      });

      // Remove the clan ID from the user's clans array
      await User.findByIdAndUpdate(userId, { $pull: { clan: ClanId } });

      const updatedClan = await Clan.findById(ClanId);

      if (isAdmin && updatedClan.admins.length === 0) {
        // If the user is the last admin, delete the clan
        await Clan.findByIdAndDelete(ClanId);

        // Remove the clan ID from all users' clans array
        await User.updateMany({}, { $pull: { clan: ClanId } });

        return res
          .status(200)
          .json({ message: "Clan deleted since no admins left" });
      }

      return res.status(200).json({
        message: "User removed from clan successfully",
        clan: updatedClan,
      });
    } else {
      // Add the user to the clan
      await Clan.findByIdAndUpdate(ClanId, {
        $addToSet: { members: userId },
      });

      // Add the clan ID to the user's clans array
      await User.findByIdAndUpdate(userId, { $addToSet: { clan: ClanId } });

      const updatedClan = await Clan.findById(ClanId);

      res.status(200).json({
        message: "User added to clan successfully",
        clan: updatedClan,
      });
    }
  } catch (error) {
    console.error("Error adding/removing user to/from clan:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateAdminStatus = async (req, res) => {
  const { ClanId } = req.params;
  const { userId } = req.body;

  try {
    const clan = await Clan.findById(ClanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is an admin
    const isAdmin = clan.admins.includes(userId);

    if (isAdmin) {
      // Remove the user from the admins array
      clan.admins = clan.admins.filter(
        (adminId) => adminId.toString() !== userId
      );

      // If the user is the last admin, delete the clan
      if (clan.admins.length === 0) {
        await Clan.findByIdAndDelete(ClanId);

        // Remove the clan ID from all users' clans array
        await User.updateMany({}, { $pull: { clans: ClanId } });

        return res
          .status(200)
          .json({ message: "Clan deleted since no admins left" });
      }

      await clan.save();

      // Remove the clan ID from the user's clans array
      await User.findByIdAndUpdate(userId, { $pull: { clans: ClanId } });

      return res.status(200).json({ message: "User removed from admins" });
    } else {
      // Add the user to the admins array
      clan.admins.push(userId);
      await clan.save();

      // Add the clan ID to the user's clans array
      await User.findByIdAndUpdate(userId, { $addToSet: { clans: ClanId } });

      return res.status(200).json({ message: "User added as admin" });
    }
  } catch (error) {
    console.error("Error updating admin status:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// get clans  by category
export const getClansByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    // Find clans with the specified category
    const clans = await Clan.find({ clanCategory: categoryId })
      .populate("admins", "username")
      .populate("members", "username")
      .populate("posts", "title")
      .populate("clanCategory", "name");

    res.json(clans);
  } catch (error) {
    console.error("Error in getClansByCategory controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createPostInClan = async (req, res) => {
  const { title, content, category } = req.body;
  const userId = req.user._id;
  const clanId = req.params.ClanId;

  // let photo = "";
  // if (req.file && req.file.path) {
  //   photo = req.file.path.replace(/\\/g, "/");
  // }

  // new config for cloudinary
  let photo = "";
  if (req.file && req.file.path) {
    photo = useCloudinary ? req.file.path : req.file.path.replace(/\\/g, "/");
  }

  try {
    // Validate clan
    const clan = await Clan.findById(clanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    // Check if the user is a member of the clan
    const isMember = clan.members.includes(userId);
    const isAdmin = clan.admins.includes(userId);
    const isModerator = clan.moderators.includes(userId);
    if (!isMember && !isAdmin && !isModerator) {
      return res
        .status(403)
        .json({ error: "You are not a member of this clan" });
    }

    // Create new post
    const newPost = new Post({
      title,
      content,
      photo,
      user: userId,
      clan: clanId,
      category,
    });

    // Save the post
    const savedPost = await newPost.save();

    // Add the post to the clan's posts array
    clan.posts.push(savedPost._id);
    await clan.save();

    // Optionally, add the post to the user's posts array
    await User.findByIdAndUpdate(userId, { $push: { posts: savedPost._id } });

    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error in createPostInClan controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateClanPost = async (req, res) => {
  const { postId } = req.params;
  const { title, content, category, imageDeleted } = req.body;
  const userId = req.user._id;

  try {
    // Find the post by its ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the user is the author of the post or an admin of the clan
    const clan = await Clan.findById(post.clan);
    const isAuthor = post.user.toString() === userId.toString();
    const isAdmin = clan.admins.some(
      (adminId) => adminId.toString() === userId.toString()
    );
    const isModerator = clan.moderators.some(
      (modId) => modId.toString() === userId.toString()
    );

    if (!isAuthor && !isAdmin && !isModerator) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this post" });
    }

    // new config for cloudinary
    // Handle image deletion or update
    if (imageDeleted === "true") {
      if (post.photo) {
        if (useCloudinary) {
          try {
            const regex = /\/modjo\/([^/]+)\.\w+$/;
            const match = post.photo.match(regex);
            if (match && match[1]) {
              const public_id = `modjo/${match[1]}`;
              console.log(
                "Attempting to delete post image with public_id:",
                public_id
              );
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
              console.log("Cloudinary post image deletion result:", result);
            } else {
              console.error(
                "Could not extract public_id from post image URL:",
                post.photo
              );
            }
          } catch (err) {
            console.error("Error deleting photo from Cloudinary:", err);
          }
        } else {
          const photoPath = path.join(process.cwd(), post.photo);
          try {
            await fs.unlink(photoPath);
          } catch (err) {
            console.error("Error deleting old photo:", err);
          }
        }
      }
      post.photo = "";
    } else if (req.file && req.file.path) {
      if (post.photo) {
        if (useCloudinary) {
          try {
            const regex = /\/modjo\/([^/]+)\.\w+$/;
            const match = post.photo.match(regex);
            if (match && match[1]) {
              const public_id = `modjo/${match[1]}`;
              console.log(
                "Attempting to delete old post image with public_id:",
                public_id
              );
              const result = await cloudinary.uploader.destroy(public_id);
              console.log("Cloudinary old post image deletion result:", result);
            } else {
              console.error(
                "Could not extract public_id from old post image URL:",
                post.photo
              );
            }
          } catch (err) {
            console.error("Error deleting old photo from Cloudinary:", err);
          }
        } else {
          const photoPath = path.join(process.cwd(), post.photo);
          try {
            await fs.unlink(photoPath);
          } catch (err) {
            console.error("Error deleting old photo:", err);
          }
        }
      }
      post.photo = useCloudinary
        ? req.file.path
        : req.file.path.replace(/\\/g, "/");
    }

    // Update the post with the new data
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    // post.photo = post.photo || photo; // Update this line

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error in updateClanPost controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteClanPost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;
  try {
    // Find the post by its ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    // Check if the user is the author of the post or an admin of the clan
    const clan = await Clan.findById(post.clan);
    const isAuthor = post.user.toString() === userId.toString();
    const isAdmin = clan.admins.some(
      (adminId) => adminId.toString() === userId.toString()
    );
    const isMod = clan.moderators.some(
      (modId) => modId.toString() === userId.toString()
    );
    if (!isAuthor && !isAdmin && !isMod) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this post" });
    }
    // Delete the post's photo from the server
    // if (post.photo) {
    //   const photoPath = path.join(__dirname, "..", post.photo);
    //   try {
    //     await fs.unlink(photoPath);
    //   } catch (err) {
    //     console.error("Error deleting post's photo:", err);
    //   }
    // }

    // new config for cloudinary in prod and multer for dev env
    if (post.photo) {
      if (useCloudinary) {
        try {
          const regex = /\/modjo\/([^/]+)\.\w+$/;
          const match = post.photo.match(regex);
          if (match && match[1]) {
            const public_id = `modjo/${match[1]}`;
            console.log(
              "Attempting to delete post image with public_id:",
              public_id
            );
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
            console.log("Cloudinary post image deletion result:", result);
          } else {
            console.error(
              "Could not extract public_id from post image URL:",
              post.photo
            );
          }
        } catch (err) {
          console.error("Error deleting photo from Cloudinary:", err);
        }
      } else {
        const photoPath = path.join(process.cwd(), post.photo);
        try {
          await fs.unlink(photoPath);
        } catch (err) {
          console.error("Error deleting post's photo:", err);
        }
      }
    }
    // Remove the post from the clan's posts array
    await Clan.findByIdAndUpdate(post.clan, { $pull: { posts: post._id } });
    // Remove the post from the user's posts array
    await User.findByIdAndUpdate(post.user, { $pull: { posts: post._id } });
    // Delete the post
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in deleteClanPost controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// we need to implemnet the weekly trending posts
export const getTrendingPostsInClan = async (req, res) => {
  const { ClanId } = req.params;

  try {
    const clan = await Clan.findById(ClanId);

    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    if (clan.posts.length === 0) {
      return res.json([]);
    }

    const trendingPosts = await Post.aggregate([
      { $match: { _id: { $in: clan.posts } } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "clans",
          localField: "clan",
          foreignField: "_id",
          as: "clan",
        },
      },
      { $unwind: "$clan" },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          photo: 1,
          shareCount: 1,
          createdAt: 1,
          upVotes: 1,
          downVotes: 1,
          comments: 1,
          "user._id": 1,
          "user.username": 1,
          "user.profilePic": 1,
          "category._id": 1,
          "category.name": 1,
          "clan._id": 1,
          "clan.name": 1,
          engagementScore: {
            $add: [
              { $size: "$upVotes" },
              { $size: "$downVotes" },
              { $size: "$comments" },
              "$shareCount",
            ],
          },
        },
      },
      { $sort: { engagementScore: -1 } },
    ]);

    res.json(trendingPosts);
  } catch (error) {
    console.error("Error in getTrendingPostsInClan controller:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

export const getPopularPostsInClan = async (req, res) => {
  const { ClanId } = req.params;

  try {
    // Find the clan by ID
    const clan = await Clan.findById(ClanId).populate("posts");
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    // Get the popular posts in the clan
    const popularPosts = await Post.find({
      _id: { $in: clan.posts.map((post) => post._id) },
    })
      .sort({ upVotes: -1 })
      .limit(10)
      .populate("user", "username profilePic")
      .populate("category", "name")
      .populate("clan", "name")
      .lean();

    res.json(popularPosts);
  } catch (error) {
    console.error("Error in getPopularPostsInClan controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getNewestPostsInClan = async (req, res) => {
  const { ClanId } = req.params;

  try {
    // Find the clan by ID
    const clan = await Clan.findById(ClanId).populate("posts");
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    // Get the newest posts in the clan
    const newestPosts = await Post.find({
      _id: { $in: clan.posts.map((post) => post._id) },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "username profilePic")
      .populate("category", "name")
      .populate("clan", "name")
      .lean();

    res.json(newestPosts);
  } catch (error) {
    console.error("Error in getNewestPostsInClan controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getWeeklyClansRanking = async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get the clans with the highest engagement in the last week
    const weeklyClanRanking = await Clan.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "posts",
          foreignField: "_id",
          as: "clanPosts",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "clanCategory",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          name: 1,
          memberCount: { $size: "$members" },
          bannerImage: 1,
          clanCategory: { $arrayElemAt: ["$category.name", 0] },
          clanPosts: {
            $filter: {
              input: "$clanPosts",
              as: "post",
              cond: { $gte: ["$$post.createdAt", oneWeekAgo] },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          memberCount: 1,
          bannerImage: 1,
          clanCategory: 1,
          engagementScore: {
            $sum: {
              $map: {
                input: "$clanPosts",
                as: "post",
                in: {
                  $sum: [
                    { $size: "$$post.upVotes" },
                    { $multiply: [{ $size: "$$post.downVotes" }, -1] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          engagementScore: -1,
          memberCount: -1,
        },
      },
      {
        $limit: 10, // Limit to top 10 clans
      },
    ]);

    res.json(weeklyClanRanking);
  } catch (error) {
    console.error("Error in getWeeklyClansRanking controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMonthlyClansRanking = async (req, res) => {
  try {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get the clans with the highest engagement in the last month
    const monthlyClanRanking = await Clan.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "posts",
          foreignField: "_id",
          as: "clanPosts",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "clanCategory",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          name: 1,
          memberCount: { $size: "$members" },
          bannerImage: 1,
          clanCategory: { $arrayElemAt: ["$category.name", 0] },
          engagementScore: {
            $sum: {
              $map: {
                input: "$clanPosts",
                as: "post",
                in: {
                  $sum: [
                    { $size: "$$post.upVotes" },
                    { $multiply: [{ $size: "$$post.downVotes" }, -1] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          engagementScore: -1,
          memberCount: -1,
        },
      },
      {
        $limit: 10, // Limit to top 10 clans
      },
    ]);

    res.json(monthlyClanRanking);
  } catch (error) {
    console.error("Error in getMonthlyClansRanking controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllTimeClansRanking = async (req, res) => {
  try {
    // Get the clans with the highest engagement of all time
    const allTimeClansRanking = await Clan.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "posts",
          foreignField: "_id",
          as: "clanPosts",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "clanCategory",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          name: 1,
          memberCount: { $size: "$members" },
          bannerImage: 1,
          clanCategory: { $arrayElemAt: ["$category.name", 0] },
          engagementScore: {
            $sum: {
              $map: {
                input: "$clanPosts",
                as: "post",
                in: {
                  $sum: [
                    { $size: "$$post.upVotes" },
                    { $multiply: [{ $size: "$$post.downVotes" }, -1] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          engagementScore: -1,
          memberCount: -1,
        },
      },
      {
        $limit: 10, // Limit to top 10 clans
      },
    ]);

    res.json(allTimeClansRanking);
  } catch (error) {
    console.error("Error in getAllTimeClansRanking controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const changeRoleToAdmin = async (req, res) => {
  const { ClanId, userId } = req.params;
  try {
    const clan = await Clan.findById(ClanId).populate("admins");
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is already an admin
    const isAdmin = clan.admins.some(
      (admin) => admin._id.toString() === userId
    );
    if (isAdmin) {
      return res
        .status(400)
        .json({ error: "User is already an admin of this clan" });
    }

    // Check if the user making the request is the first admin of the clan
    const firstAdminId = clan.admins[0]?._id.toString();
    const requestingUserId = req.user._id.toString();
    if (firstAdminId !== requestingUserId) {
      return res
        .status(403)
        .json({ error: "Only the first admin can change roles to admin" });
    }

    // Check if the user is a moderator
    const isModerator = clan.moderators.some(
      (moderator) => moderator._id.toString() === userId
    );
    if (isModerator) {
      // Remove the user from the moderators array
      clan.moderators = clan.moderators.filter(
        (moderatorId) => moderatorId.toString() !== userId
      );
      // Add the user to the admins array
      clan.admins.push(userId);
    } else {
      // Check if the user is a member
      const isMember = clan.members.some(
        (member) => member._id.toString() === userId
      );
      if (isMember) {
        // Remove the user from the members array
        clan.members = clan.members.filter(
          (memberId) => memberId.toString() !== userId
        );
        // Add the user to the admins array
        clan.admins.push(userId);
      } else {
        return res
          .status(400)
          .json({ error: "User is not a moderator or member of this clan" });
      }
    }

    await clan.save();
    // Add the clan ID to the user's clans array
    await User.findByIdAndUpdate(userId, { $addToSet: { clans: ClanId } });
    res
      .status(200)
      .json({ message: "User role changed to admin", updatedClan: clan });
  } catch (error) {
    console.error("Error changing role to admin:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const changeRoleToMember = async (req, res) => {
  const { ClanId, userId } = req.params;

  try {
    const clan = await Clan.findById(ClanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const requestingUserId = req.user._id.toString();
    const isAdmin = clan.admins.includes(requestingUserId);
    const isModerator = clan.moderators.includes(requestingUserId);
    const isFirstAdmin = clan.admins[0]?.toString() === requestingUserId;

    if (!isAdmin && !isModerator) {
      return res
        .status(403)
        .json({ error: "You are not authorized to change roles" });
    }

    const isUserAdmin = clan.admins.includes(userId);
    const isUserModerator = clan.moderators.includes(userId);

    if (isAdmin || (isModerator && !isUserAdmin)) {
      // Remove the user from the admins array
      clan.admins = clan.admins.filter(
        (adminId) => adminId.toString() !== userId
      );

      // Remove the user from the moderators array
      clan.moderators = clan.moderators.filter(
        (moderatorId) => moderatorId.toString() !== userId
      );

      // Add the user to the members array if not already a member
      if (!clan.members.includes(userId)) {
        clan.members.push(userId);
      }
    } else {
      return res
        .status(400)
        .json({ error: "User is not an admin or moderator of this clan" });
    }

    await clan.save();

    res
      .status(200)
      .json({ message: "User role changed to member", updatedClan: clan });
  } catch (error) {
    console.error("Error changing role to member:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const changeRoleToModerator = async (req, res) => {
  const { ClanId, userId } = req.params;

  try {
    const clan = await Clan.findById(ClanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const requestingUserId = req.user._id.toString();
    const isAdmin = clan.admins.includes(requestingUserId);
    const isModerator = clan.moderators.includes(requestingUserId);

    if (!isAdmin && !isModerator) {
      return res
        .status(403)
        .json({ error: "You are not authorized to change roles" });
    }

    // Check if the user is already a moderator
    const isUserModerator = clan.moderators.includes(userId);

    if (isUserModerator) {
      return res
        .status(400)
        .json({ error: "User is already a moderator of this clan" });
    }

    // Remove the user from the admins array if they are an admin
    clan.admins = clan.admins.filter(
      (adminId) => adminId.toString() !== userId
    );

    // Remove the user from the members array if they are a member
    clan.members = clan.members.filter(
      (memberId) => memberId.toString() !== userId
    );

    // Add the user to the moderators array
    clan.moderators.push(userId);

    await clan.save();

    res
      .status(200)
      .json({ message: "User role changed to moderator", updatedClan: clan });
  } catch (error) {
    console.error("Error changing role to moderator:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const removeMemberFromClan = async (req, res) => {
  const { ClanId, userId } = req.params;

  try {
    const clan = await Clan.findById(ClanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is an admin, moderator, or member
    const isAdmin = clan.admins.includes(userId);
    const isModerator = clan.moderators.includes(userId);
    const isMember = clan.members.includes(userId);

    if (!isAdmin && !isModerator && !isMember) {
      return res
        .status(400)
        .json({ error: "User is not associated with this clan" });
    }

    // Remove the user from the respective arrays
    clan.admins = clan.admins.filter(
      (adminId) => adminId.toString() !== userId
    );
    clan.moderators = clan.moderators.filter(
      (moderatorId) => moderatorId.toString() !== userId
    );
    clan.members = clan.members.filter(
      (memberId) => memberId.toString() !== userId
    );

    // If the user was the last admin, delete the clan
    if (isAdmin && clan.admins.length === 0) {
      // add the first mods to be the admin
      await Clan.findByIdAndDelete(ClanId);
      await User.updateMany({}, { $pull: { clans: ClanId } });
      return res
        .status(200)
        .json({ message: "Clan deleted since no admins left" });
    }

    await clan.save();

    // Remove the clan ID from the user's clans array
    await User.findByIdAndUpdate(userId, { $pull: { clans: ClanId } });

    res.status(200).json({ message: "User removed from clan successfully" });
  } catch (error) {
    console.error("Error removing member from clan:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
