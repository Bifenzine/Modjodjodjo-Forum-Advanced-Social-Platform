import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useLikeReply = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuthContext();

  const likeReply = async (replyId) => {
    if (!authUser) {
      toast.error("Please login to like reply");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.patch(
        `${config.apiUrl}/replies/likeReply/${replyId}`,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoading(false);
      toast.success("Reply liked successfully");
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      toast.error("Failed to like Reply, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { likeReply, error, loading };
};

export default useLikeReply;
