import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import config from "../../../config/config";

const useMarkClanMessagesAsRead = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const MarkClanMessagesAsRead = async (clanID) => {
    console.log("clanID to mark as read:", clanID);
    try {
      setLoading(true);
      const response = await axios.patch(
        `${config.apiUrl}/messages/Clans/${clanID}/markClanMessagesAsRead`,
        FormData,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoading(false);
      //   toast.success("Clan Message marked as read successfully");
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      //   toast.error("Failed to mark Clan Message as read, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { MarkClanMessagesAsRead, error, loading };
};

export default useMarkClanMessagesAsRead;
