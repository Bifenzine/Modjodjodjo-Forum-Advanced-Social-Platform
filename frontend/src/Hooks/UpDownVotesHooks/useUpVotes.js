// useUpvotePost.js
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useUpvotePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authUser } = useAuthContext();
  // console.log("in")
  const upvotePost = async (postId) => {
    if (!authUser) {
      toast.error("You need to be logged in to upvote a post");
      return;
    }
    // console.log("inside")
    setLoading(true);
    try {
      await axios.patch(`${config.apiUrl}/api/post/upvote/${postId}`);
      setLoading(false);
      toast.success("you upvoted this post");
    } catch (error) {
      setError(error);
      setLoading(false);
      toast.error("an error occured when upVotiong this post");
    }
  };

  return { upvotePost, loading, error };
};

export default useUpvotePost;
