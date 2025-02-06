// useDownvotePost.js
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useDownvotePost = () => {
  const [LoadingDownvote, setLoadingDownvote] = useState(false);
  const [error, setError] = useState(null);
  const { authUser } = useAuthContext();

  const downvotePost = async (postId) => {
    if (!authUser) {
      toast.error("You need to be logged in to downvote a post");
      return;
    }
    setLoadingDownvote(true);
    try {
      await axios.patch(`${config.apiUrl}/api/post/downvote/${postId}`);
      setLoadingDownvote(false);
      toast.success("you downvoted this post");
    } catch (error) {
      setError(error);
      setLoadingDownvote(false);
      toast.error("an error occured when downvoting");
    }
  };

  return { downvotePost, LoadingDownvote, error };
};

export default useDownvotePost;
