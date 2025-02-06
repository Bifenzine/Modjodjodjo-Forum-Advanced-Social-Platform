import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../../Context/AuthContext";
import config from "../../../config/config";

const useMarkAsSeen = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { authUser } = useAuthContext();

  const markAsSeen = async (conversationId) => {
    if (!authUser) {
      toast.error("You need to be logged in to create a conversation");
      return;
    }
    // console.log("conversationId", conversationId);

    try {
      setLoading(true);
      const response = await axios.patch(
        `${config.apiUrl}/conversations/${conversationId}/seen`,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoading(false);
      // toast.success("Conversation marked as seen !!!");
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      // toast.error("Conversation not marked as seen, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { markAsSeen, error, loading };
};

export default useMarkAsSeen;
