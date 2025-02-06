import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useSendMessage = () => {
  const [error, setError] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const { authUser } = useAuthContext();

  const sendMessage = async (formData, receiverID) => {
    // console.log(formData.get("content"));

    if (!authUser) {
      toast.error("You need to be logged in to send message");
      return;
    }

    const success = handleInputErrors(formData);

    //if we didn't receive the data the function will stop
    if (!success) {
      setLoadingMsg(false);
      return;
    }
    console.log(receiverID);

    try {
      setLoadingMsg(true);
      const response = await axios.post(
        `${config.apiUrl}/messages/send/${receiverID}`,
        formData,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoadingMsg(false);
      toast.success("Your message is created !!!");
      return response.data;
    } catch (error) {
      setLoadingMsg(false);
      setError(error.response.data.error);
      toast.error("Message is not Published, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { sendMessage, error, loadingMsg };
};

export default useSendMessage;

function handleInputErrors(formData) {
  if (!formData.get("content") && !formData.get("image")) {
    //sending error message using toast library
    toast.error("at least add a message or an image to create a message");
    return false;
  }

  return true;
}
