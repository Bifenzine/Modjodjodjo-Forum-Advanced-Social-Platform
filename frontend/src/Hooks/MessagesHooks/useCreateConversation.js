import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useCreateConversation = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { authUser } = useAuthContext();

  const createConversation = async (participantID) => {
    if (!authUser) {
      toast.error("You need to be logged in to create a conversation");
      return;
    }
    console.log(participantID);

    try {
      setLoading(true);
      const response = await axios.post(
        `${config.apiUrl}/conversations/${participantID}`,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoading(false);
      toast.success("Your conversation is created !!!");
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      toast.error("Conversation not Created, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { createConversation, error, loading };
};

export default useCreateConversation;
