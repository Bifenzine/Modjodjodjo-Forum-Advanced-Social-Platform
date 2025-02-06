import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useDeleteReply = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Access the navigate function for navigation
  const { authUser } = useAuthContext();

  const alertConfirmation = () => {
    return window.confirm("Are you sure you want to delete this reply?");
  };

  const deleteReply = async (commentId) => {
    if (!authUser) {
      toast.error("Please login to delete reply");
      return;
    }
    if (!alertConfirmation()) {
      toast.success("reply is not deleted ");
      return; // If user cancels, stop the function
    }

    console.log(commentId);

    try {
      setLoading(true);
      const response = await axios.delete(
        `${config.apiUrl}/replies/deleteReply/${commentId}`,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoading(false);
      toast.success("Reply deleted successfully!");
      // navigate(-1); //previous page
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      toast.error("Failed to delete Reply , try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { deleteReply, error, loading };
};

export default useDeleteReply;
