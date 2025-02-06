import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useUpdateUser = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext(); // Use the AuthContext hook to access setAuthUser

  const alertConfirmation = () => {
    return window.confirm("Are you sure you want to update your profile info?");
  };

  const updateUserProfile = async (formData) => {
    if (!alertConfirmation()) {
      toast.success("Profile is not updated ");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.patch(
        `${config.apiUrl}/loggedUser/edit`,
        formData,
        {
          withCredentials: true,
        }
      );
      setLoading(false);
      toast.success("Profile updated successfully");

      // Update the authUser context with the updated user object
      setAuthUser(response.data);

      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      toast.error("Failed to update your Profile");
      throw new Error(error.response.data.error);
    }
  };

  return { updateUserProfile, error, loading };
};

export default useUpdateUser;
