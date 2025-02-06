import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSocketContext } from "../../Context/SocketContext";
import config from "../../config/config";

const useDeleteMessage = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocketContext();

  const alertConfirmation = () => {
    return window.confirm("Are you sure you want to delete this message?");
  };

  const deleteMessage = async (msgId, conversationId) => {
    if (!alertConfirmation()) {
      toast.success("Message is not deleted");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `${config.apiUrl}/messages/${msgId}`,
        {
          withCredentials: true,
          headers: { "x-client-type": "web" },
        }
      );
      setLoading(false);
      toast.success("Message deleted successfully!");

      // Emit socket event for message deletion
      if (socket) {
        socket.emit("deleteUserMessage", { messageId: msgId, conversationId });
      }

      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      toast.error("Failed to delete message, try again");
      throw new Error(error.response.data.error);
    }
  };

  return { deleteMessage, error, loading };
};

export default useDeleteMessage;
