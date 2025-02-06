import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { cloudinary } from "../Storage/Cloudinary.config.js";

dotenv.config();
// cloudinary trigger in production env
const useCloudinary = process.env.NODE_ENV === "production";

export const editProfile = async (req, res) => {
  // Get the directory name of the current module file
  const __dirname = path.dirname(new URL(import.meta.url).pathname);

  // Get the logged user's ID from the middleware
  const userId = req.user._id;

  try {
    // Find the user by ID
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Handle profile picture update
    // if (req.file) {
    //   // Construct the file path of the previous profile picture
    //   const prevProfilePicPath = path.join(
    //     __dirname,
    //     "../public",
    //     user.profilePic
    //   );

    //   // Check if the previous profile picture exists and delete it
    //   if (fs.existsSync(prevProfilePicPath)) {
    //     fs.unlinkSync(prevProfilePicPath);
    //   }

    //   // Normalize the file path of the new profile picture
    //   const profilePicPath = req.file.path.replace(/\\/g, "/");

    //   // Update the user object with the new profile picture filename
    //   user.profilePic = profilePicPath;
    // }

    // new config for cloudinary in production and multer locaalstorage for developpment
    if (req.file) {
      console.log(req.file);
      if (useCloudinary) {
        // Delete old image from Cloudinary if it exists
        if (user?.profilePic) {
          // Extract public_id from Cloudinary URL
          try {
            const regex = /\/modjo\/([^/]+)\.\w+$/;
            const match = user.profilePic.match(regex);
            if (match && match[1]) {
              const public_id = `modjo/${match[1]}`;
              console.log(
                "Attempting to delete image with public_id:",
                public_id
              );
              const isVideo =
                user.profilePic.includes("/video/upload/") ||
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
              console.error(
                "Could not extract public_id from URL:",
                user.profilePic
              );
            }
          } catch (cloudinaryError) {
            console.error(
              "Error deleting image from Cloudinary:",
              cloudinaryError
            );
          }
          // Update with new Cloudinary URL
          user.profilePic = req.file.path;
          console.log(user.profilePic);
        }
      } else {
        // Local storage logic
        if (user.profilePic) {
          const prevProfilePicPath = path.join(
            __dirname,
            "..",
            user.profilePic
          );
          await fs
            .unlink(prevProfilePicPath)
            .catch((err) =>
              console.error("Error deleting old profile picture:", err)
            );
        }
        user.profilePic = req.file.path.replace(/\\/g, "/");
      }
    }

    // Update other fields of the user profile with data from req.body
    user.fullName = req.body.fullName;
    user.username = req.body.username;
    user.email = req.body.email;
    user.gender = req.body.gender;

    // Save the updated user profile
    user = await user.save();

    res.json(user);
  } catch (error) {
    console.log("Problem in the edit user controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteProfile = async (req, res) => {
  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Delete user's posts and comments
    await Promise.all([
      Post.deleteMany({ user: userId }),
      Comment.deleteMany({ user: userId }),
    ]);

    // Delete profile picture if it exists
    if (user.profilePic) {
      if (useCloudinary) {
        // Extract public_id from Cloudinary URL
        try {
          const regex = /\/modjo\/([^/]+)\.\w+$/;
          const match = user.profilePic.match(regex);
          if (match && match[1]) {
            const public_id = `modjo/${match[1]}`;
            console.log(
              "Attempting to delete image with public_id:",
              public_id
            );
            const isVideo =
              user.profilePic.includes("/video/upload/") ||
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
            console.error(
              "Could not extract public_id from URL:",
              user.profilePic
            );
          }
        } catch (cloudinaryError) {
          console.error(
            "Error deleting image from Cloudinary:",
            cloudinaryError
          );
        }
      } else {
        const prevProfilePicPath = path.join(__dirname, "..", user.profilePic);
        await fs
          .unlink(prevProfilePicPath)
          .catch((err) =>
            console.error("Error deleting old profile picture:", err)
          );
      }
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Clear the JWT cookie
    res.clearCookie("jwt");

    console.log("User deleted", userId);
    res.json({ msg: "User profile deleted successfully" });
  } catch (error) {
    console.log("Problem in the delete user controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
