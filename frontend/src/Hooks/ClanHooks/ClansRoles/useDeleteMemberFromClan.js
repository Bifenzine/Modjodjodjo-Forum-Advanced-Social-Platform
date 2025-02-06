import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../../Context/AuthContext";
import config from "../../../config/config";

const useDeleteMemberFromClan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authUser } = useAuthContext();

  const alertConfirmation = () => {
    return window.confirm(
      "are you sure you want to remove this user from the clan?"
    );
  };

  const deleteMemberFromClan = async (clanId, userId) => {
    if (!authUser) {
      toast.error("You need to be logged in to achive this action");
      setLoading(false);
      return;
    }
    if (!alertConfirmation()) {
      toast.success("user is not removed from clan");
      return; // If user cancels, stop the function
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(
        `${config.apiUrl}/clans/removeMember/${clanId}/${userId}`,
        null,
        {
          headers: {
            "x-client-type": "web",
          },
        }
      );
      setLoading(false);
      return response.data;
      toast.success("user removed from clan successfully");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || "An error occurred");
      toast.error(
        err.response?.data?.error ||
          "An error occurred when removing user from clan"
      );
    }
  };

  return { deleteMemberFromClan, loading, error };
};

export default useDeleteMemberFromClan;
