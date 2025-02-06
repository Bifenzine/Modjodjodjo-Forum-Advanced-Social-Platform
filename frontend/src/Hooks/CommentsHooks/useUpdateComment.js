import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import config from "../../config/config";

const useUpdateComment = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateComment = async (FormData, commentId) => {
    console.log("Content:", FormData.get("content"));
    console.log("Photo:", FormData.get("photo"));
    const success = handleInputErrors(FormData);
    if (!success) return;

    try {
      setLoading(true);
      const response = await axios.patch(
        `${config.apiUrl}/comments/${commentId}`,
        FormData,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoading(false);
      toast.success("Comment updated successfully");
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      toast.error("Failed to update Comment, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { updateComment, error, loading };
};

export default useUpdateComment;

const handleInputErrors = (FormData) => {
  if (!FormData.get("content") && !FormData.get("photo")) {
    toast.error("at least add a content or an image to create a comment");
    return false;
  }
  return true;
};
