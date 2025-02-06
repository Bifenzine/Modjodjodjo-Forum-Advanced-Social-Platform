import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useLikeComment = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuthContext();

  const likeComment = async (commentId) => {
    if (!authUser) {
      toast.error("You need to be logged in to like a comment");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.patch(
        `${config.apiUrl}/comments/likeComment/${commentId}`,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoading(false);
      toast.success("Comment liked successfully");
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      toast.error("Failed to like Comment, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { likeComment, error, loading };
};

export default useLikeComment;
