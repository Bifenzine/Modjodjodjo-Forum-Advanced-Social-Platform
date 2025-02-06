import { useState } from "react";
import axios from "axios";
import config from "../../config/config";

const useDeletePostFromBookmark = () => {
  const [isloading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const deletePostFromBookmark = async (postId) => {
    setIsLoading(true);
    try {
      // Make a request to delete the post from the bookmark
      await axios.delete(`${config.apiUrl}/bookmark/delete/${postId}`, {
        withCredentials: true, // Send cookies with the request
        Headers: { "x-client-type": "web" },
      });
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return { isloading, error, deletePostFromBookmark };
};

export default useDeletePostFromBookmark;
