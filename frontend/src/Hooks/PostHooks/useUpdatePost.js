import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useUpdatePost = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastStatus, setToastStatus] = useState("idle");
  const { authUser } = useAuthContext();

  // tested : working
  const updatePost = async (postId, FormData) => {
    console.log(FormData);

    if (!authUser) {
      toast.error("You need to be logged in to update a post");
      return;
    }

    let progressInterval;

    try {
      setLoading(true);
      setProgress(0);
      setToastStatus("processing");

      progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await axios.patch(
        `${config.apiUrl}/api/updatePost/${postId}`,
        FormData,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );

      clearInterval(progressInterval);
      setProgress(100);
      setToastStatus("success");
      setLoading(false);
      toast.success("Post updated successfully");
      setTimeout(() => {
        setToastStatus("idle");
        setProgress(0);
      }, 2000);
      return response.data;
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setToastStatus("error");
      setLoading(false);
      setProgress(0);

      setTimeout(() => {
        setToastStatus("idle");
      }, 2000);
      setError(error.response.data.error);
      toast.error("Failed to update post");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { updatePost, error, loading, progress, toastStatus, setToastStatus };
};

export default useUpdatePost;
