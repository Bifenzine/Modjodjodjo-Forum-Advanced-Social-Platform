import React, { useState, useEffect } from "react";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { getBookmarkedPosts } from "../../../DataFetching/DataFetching";
import { useAuthContext } from "../../../Context/AuthContext";
import useAddPostToBookmark from "../../../Hooks/BookmarkHooks/useAddPostToBookmark";
import useDeletePostFromBookmark from "../../../Hooks/BookmarkHooks/useDeletePostFromBookmark";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

const BookmarkPost = ({ postId }) => {
  const { deletePostFromBookmark, isloading } = useDeletePostFromBookmark();
  const { addPostToBookmark, loading } = useAddPostToBookmark();
  const { authUser } = useAuthContext();

  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        if (authUser) {
          const data = await getBookmarkedPosts();
          setBookmarkedPosts(data);
          setIsBookmarked(data.some((post) => post._id === postId));
        }
      } catch (error) {
        console.error("Error fetching bookmarked posts:", error);
      }
    };

    fetchBookmarkedPosts();
  }, [authUser, postId]);

  const handleBookmarkClick = async () => {
    try {
      if (isBookmarked && authUser) {
        await deletePostFromBookmark(postId);
        setIsBookmarked(false);
        toast.success("Post removed from bookmarks");
      } else if (!isBookmarked && authUser) {
        await addPostToBookmark(postId);
        setIsBookmarked(true);
        toast.success("Post added to bookmarks");
      } else {
        toast.error("You need to be logged in to bookmark a post");
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
      toast.error("An error occurred while updating the bookmark.");
    }
  };

  return (
    <>
      {loading || isloading ? (
        <>
          <Loader className="animate-spin w-5 h-5 mx-auto" />
        </>
      ) : (
        <>
          {isBookmarked && authUser ? (
            <IoBookmark
              onClick={handleBookmarkClick}
              style={{ color: "yellow" }}
            />
          ) : (
            <IoBookmarkOutline onClick={handleBookmarkClick} />
          )}
        </>
      )}
    </>
  );
};

export default BookmarkPost;
