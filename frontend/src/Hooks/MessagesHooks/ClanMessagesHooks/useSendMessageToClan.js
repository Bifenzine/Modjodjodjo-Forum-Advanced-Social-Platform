import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../../Context/AuthContext";
import config from "../../../config/config";

const useSendMessageToClan = () => {
  const [error, setError] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const { authUser } = useAuthContext();

  const sendMessageToClan = async (formData, ClanID) => {
    if (!authUser) {
      toast.error("You need to be logged in to send message");
      return;
    }

    const success = handleInputErrors(formData);

    if (!success) {
      setLoadingMsg(false);
      return;
    }

    try {
      setLoadingMsg(true);
      const response = await axios.post(
        `${config.apiUrl}/messages/Clans/${ClanID}/messages`,
        formData,
        {
          withCredentials: true,
          headers: { "x-client-type": "web" },
        }
      );
      setLoadingMsg(false);
      toast.success("Your message is sent to the Clan!");
      return response.data; // Return the new message data
    } catch (error) {
      setLoadingMsg(false);
      setError(error.response.data.error);
      toast.error("Message is not Published in the Clan, try again");
      throw new Error(error.response.data.error);
    }
  };

  return { sendMessageToClan, error, loadingMsg };
};

export default useSendMessageToClan;

function handleInputErrors(formData) {
  if (!formData.get("content") && !formData.get("image")) {
    toast.error("at least add a message or an image to create a message");
    return false;
  }
  return true;
}
