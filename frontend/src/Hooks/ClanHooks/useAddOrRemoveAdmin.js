import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useAddOrRemoveAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authUser } = useAuthContext();

  const addOrRemoveAdmin = async (clanId) => {
    setLoading(true);
    setError(null);
    if (!authUser) {
      toast.error("You need to be logged in to achive this action");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.patch(
        `${config.apiUrl}/clans/updateAdminStatus/${clanId}`,
        null,
        {
          headers: {
            "x-client-type": "web",
          },
        }
      );
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  return { addOrRemoveAdmin, loading, error };
};

export default useAddOrRemoveAdmin;
