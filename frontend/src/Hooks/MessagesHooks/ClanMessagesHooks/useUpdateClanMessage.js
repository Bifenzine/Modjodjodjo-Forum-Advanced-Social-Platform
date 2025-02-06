import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import config from "../../../config/config";

const useUpdateMessage = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateMessage = async (FormData, msgID, clanID) => {
    console.log("Content:", FormData.get("content"));
    console.log("Photo:", FormData.get("photo"));
    console.log("msgID:", msgID);
    const success = handleInputErrors(FormData);
    if (!success) return;

    try {
      setLoading(true);
      const response = await axios.patch(
        `${config.apiUrl}/messages/Clans/${clanID}/messages/${msgID}`,
        FormData,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoading(false);
      toast.success("Clan Message updated successfully");
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      toast.error("Failed to update Clan Message, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { updateMessage, error, loading };
};

export default useUpdateMessage;

const handleInputErrors = (FormData) => {
  if (!FormData.get("content") && !FormData.get("photo")) {
    toast.error("at least add a content or an image to update a message");
    return false;
  }
  return true;
};
