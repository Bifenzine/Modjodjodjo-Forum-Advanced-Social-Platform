import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../../Context/AuthContext";
import config from "../../../config/config";

const useChangeToMods = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authUser } = useAuthContext();

  const alertConfirmation = () => {
    return window.confirm(
      "are you sure you want to change the role of this user to moderator?"
    );
  };

  const changeToMods = async (clanId, userId) => {
    if (!authUser) {
      toast.error("You need to be logged in to achive this action");
      setLoading(false);
      return;
    }
    if (!alertConfirmation()) {
      toast.success("Role is not changed");
      return; // If user cancels, stop the function
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.patch(
        `${config.apiUrl}/clans/changeRoleToModerator/${clanId}/${userId}`,
        null,
        {
          headers: {
            "x-client-type": "web",
          },
        }
      );
      setLoading(false);
      return response.data;
      toast.success("Role changed successfully to moderator");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || "An error occurred");
      toast.error(
        err.response?.data?.error ||
          "An error occurred when changing role to moderator"
      );
    }
  };

  return { changeToMods, loading, error };
};

export default useChangeToMods;
