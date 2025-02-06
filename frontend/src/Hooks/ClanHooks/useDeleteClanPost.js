import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import config from "../../config/config";

const useDeleteClanPost = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Access the navigate function for navigation

  const alertConfirmation = () => {
    return window.confirm("Are you sure you want to delete this post?");
  };

  const deleteClanPost = async (postId) => {
    if (!alertConfirmation()) {
      toast.success("Post is not deleted ");
      return; // If user cancels, stop the function
    }

    console.log(postId);

    try {
      setLoading(true);
      const response = await axios.delete(
        `${config.apiUrl}/clans/deletePost/${postId}`,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoading(false);
      toast.success("Your post has been deleted !!");
      navigate(-1); //previous page
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      toast.error("Failed to delete post , try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { deleteClanPost, error, loading };
};

export default useDeleteClanPost;
