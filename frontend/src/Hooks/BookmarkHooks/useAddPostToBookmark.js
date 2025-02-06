import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useAddPostToBookmark = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authUser } = useAuthContext();

  const addPostToBookmark = async (postId) => {
    // console.log("postId", postId);

    if (!authUser) {
      toast.error("You need to be logged in to bookmark a post");
      return;
    }

    setLoading(true);
    try {
      // Make a request to delete the post from the bookmark
      await axios.post(`${config.apiUrl}/bookmark/add/${postId}`, {
        withCredentials: true, // Send cookies with the request
        Headers: { "x-client-type": "web" },
      });

      // toast.success("Post Bookmarked successfuly");
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
      // toast.error("an error has occured when bookmarking the post");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, addPostToBookmark };
};

export default useAddPostToBookmark;
