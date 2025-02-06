import React, { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import useCreateConversation from "../../Hooks/MessagesHooks/useCreateConversation";
import { getConversations } from "../../DataFetching/DataFetching";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { useAuthContext } from "../../Context/AuthContext";

const CreateConversation = ({ participantID }) => {
  const [conversations, setConversations] = useState(null);
  // const [loading, setLoading] = useState(true);
  const { createConversation, loading } = useCreateConversation();
  const { authUser } = useAuthContext();

  useEffect(() => {
    getConversations()
      .then((response) => {
        if (response) {
          setConversations(response);
          // console.log(response);
        } else {
          // console.error("Conversations not found");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [conversations]);

  const isConversationExist = () => {
    if (!conversations) return false;
    return conversations.some((conv) =>
      conv.participants.some((participant) => participant.id === participantID)
    );
  };

  const CreateConvers = () => {
    if (isConversationExist()) {
      console.log("Conversation already exists with this participant");
      toast.error("Conversation already exists with this participant");
    } else {
      createConversation(participantID);
    }
  };

  return (
    <Button
      className={authUser ? "" : "disabled"}
      onClick={CreateConvers}
      disabled={loading || isConversationExist()}>
      {loading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : null}
      {isConversationExist() ? "Conversation Exists" : "Create Conversation"}
    </Button>
  );
};

export default CreateConversation;
