import Bookmark from "../models/bookmark.model.js";
import Post from "../models/post.model.js";

export const getBookmarkedPosts = async (req, res) => {
  try {
    // Find the bookmark document for the current user
    const bookmark = await Bookmark.findOne({ user: req.user._id }).populate({
      path: "bookmarkedPosts",
      populate: [
        {
          path: "category",
          select: "", // Select the fields you want to include from the category
        },
        {
          path: "clan",
          select: "", // Select the fields you want to include from the clan
        },
        {
          path: "user",
          select: "-password -gender -createdAt -updatedAt", // Exclude password, gender, etc.
        },
      ],
    });

    if (!bookmark) {
      return res
        .status(404)
        .json({ message: "No bookmark found for this user" });
    }

    res.status(200).json(bookmark.bookmarkedPosts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const addToBookmark = async (req, res) => {
  const postId = req.params.postId;
  try {
    // Check if the post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user already has a bookmark document
    let bookmark = await Bookmark.findOne({ user: req.user._id });

    if (!bookmark) {
      // If user doesn't have a bookmark document, create one
      bookmark = new Bookmark({
        user: req.user._id,
        bookmarkedPosts: [postId],
      });
    } else {
      // If user already has a bookmark document, check if the post is already bookmarked
      if (bookmark.bookmarkedPosts.includes(postId)) {
        return res.status(400).json({ message: "Post already bookmarked" });
      }
      // Add the post to the user's bookmark list
      bookmark.bookmarkedPosts.push(postId);
    }

    await bookmark.save();

    res.status(200).json({ message: "Post added to bookmark successfully" });
  } catch (error) {
    console.error("Error adding post to bookmark:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteFromBookmark = async (req, res) => {
  try {
    const postId = req.params.postId;

    // Check if the post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the bookmark document for the user
    const bookmark = await Bookmark.findOne({ user: req.user._id });

    if (!bookmark || !bookmark.bookmarkedPosts.includes(postId)) {
      return res
        .status(404)
        .json({ message: "Post not found in bookmark list" });
    }

    // Remove the post from the user's bookmark list
    bookmark.bookmarkedPosts = bookmark.bookmarkedPosts.filter(
      (item) => item.toString() !== postId
    );
    await bookmark.save();

    res
      .status(200)
      .json({ message: "Post removed from bookmark successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
