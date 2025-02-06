import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import config from "../../config/config";

const useSharePost = () => {
  const [error, setError] = useState(null);
  const [LoadingShare, setLoadingShare] = useState(false);

  // tested : working
  const sharePost = async (postID) => {
    try {
      setLoadingShare(true);
      const response = await axios.patch(
        `${config.apiUrl}/api/post/share/${postID}`,
        FormData,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoadingShare(false);

      return response.data;
    } catch (error) {
      setLoadingShare(false);
      setError(error.response.data.error);

      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { sharePost, error, LoadingShare };
};

export default useSharePost;
