import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useFollow = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { authUser } = useAuthContext();

  const follow = async (userID) => {
    // console.log(formData.get("content"));

    if (!authUser) {
      toast.error("You need to be logged in to follow a user");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${config.apiUrl}/users/follow/${userID}`,
        {
          withCredentials: true, // Send cookies with request
        }
      );
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      toast.error("Failed to follow user, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { follow, error, loading };
};

export default useFollow;
