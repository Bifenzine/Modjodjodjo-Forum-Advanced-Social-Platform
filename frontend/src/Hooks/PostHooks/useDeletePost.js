import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import config from "../../config/config";

// tested : working
const useDeletePost = () => {
  const [error, setError] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const navigate = useNavigate(); // Access the navigate function for navigation

  const alertConfirmation = () => {
    return window.confirm("Are you sure you want to delete this post?");
  };

  const deletePost = async (postId, feed) => {
    if (!alertConfirmation()) {
      toast.success("Post is not deleted ");
      return; // If user cancels, stop the function
    }

    try {
      setLoadingDelete(true);
      const response = await axios.delete(
        `${config.apiUrl}/api/deletePost/${postId}`,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoadingDelete(false);
      toast.success("Post deleted successfully!");
      if (!feed) {
        navigate(-1); //previous pagee
      }
      return response.data;
    } catch (error) {
      setLoadingDelete(false);
      setError(error.response.data.error);
      toast.error("Failed to delete post");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { deletePost, error, loadingDelete };
};

export default useDeletePost;
