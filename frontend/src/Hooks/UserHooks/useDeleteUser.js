import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

// tested : woking
const useDeleteUser = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Access the navigate function for navigation
  const { setAuthUser } = useAuthContext();

  const alertConfirmation = () => {
    return window.confirm("Are you sure you want to delete you Profile ?");
  };

  const deleteUserProfile = async (postId) => {
    if (!alertConfirmation()) {
      toast.success("Your profile is not deleted ");
      return; // If user cancels, stop the function
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `${config.apiUrl}/loggedUser/delete`,
        {
          withCredentials: true, // Send cookies with request
        }
      );
      setLoading(false);
      toast.success("Goodbye you Profile is deleted successfully!");
      //remove the user and his data from the localstorage to log him ount from the app
      localStorage.removeItem("forum-user");
      //give the context stat of the user a value of null so it hasn't the data of the user
      setAuthUser(null);
      navigate("/"); //previous pagee
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      toast.error("Failed to delete you profile");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { deleteUserProfile, error, loading };
};

export default useDeleteUser;
