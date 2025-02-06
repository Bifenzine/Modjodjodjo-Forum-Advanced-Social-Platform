import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import config from "../../../config/config";

const useDeleteMessageFromClan = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const alertConfirmation = () => {
    return window.confirm(
      "Are you sure you want to delete this message from the clan?"
    );
  };

  const deleteMessageFromClan = async (msgID, clanID) => {
    if (!alertConfirmation()) {
      toast.success("Message is not deleted from Clan as you wished!");
      return null;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `${config.apiUrl}/messages/Clans/${clanID}/messages/${msgID}`,
        {
          withCredentials: true,
          headers: { "x-client-type": "web" },
        }
      );
      setLoading(false);
      toast.success("Message deleted successfully from Clan!");
      return response.data; // Return the deleted message data
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      toast.error("Failed to delete message from clan, try again");
      throw new Error(error.response.data.error);
    }
  };

  return { deleteMessageFromClan, error, loading };
};

export default useDeleteMessageFromClan;
