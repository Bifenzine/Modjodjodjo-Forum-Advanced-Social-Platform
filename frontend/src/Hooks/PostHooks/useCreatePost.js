import { useState } from "react";
import axios from "axios";
import { useAuthContext } from "../../Context/AuthContext";
import toast from "react-hot-toast";
import config from "../../config/config";

const useCreatePost = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastStatus, setToastStatus] = useState("idle");
  const { authUser } = useAuthContext();

  const createPost = async (formData, cancelPost) => {
    if (!authUser) {
      toast.error("You need to be logged in to create a post");
      return;
    }

    let progressInterval; // Declare the variable here so it's accessible in try/catch

    try {
      setLoading(true);
      setProgress(0);
      setToastStatus("processing");

      progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await axios.post(
        `${config.apiUrl}/api/createPost`,
        formData,
        {
          withCredentials: true,
          headers: { "x-client-type": "web" },
        }
      );

      clearInterval(progressInterval);
      setProgress(100);
      setToastStatus("success");
      setLoading(false);

      if (response.data) {
        cancelPost();
      }

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

      setError(error.response?.data?.error || "An error occurred");
      throw new Error(error.response?.data?.error || "An error occurred");
    }
  };

  return { createPost, error, loading, progress, toastStatus, setToastStatus };
};

export default useCreatePost;
