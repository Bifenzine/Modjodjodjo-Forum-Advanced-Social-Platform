import React, { useEffect, useState } from "react";
import { getConversations } from "../../DataFetching/DataFetching";
import getProfilePicUrl from "../../Utils/GetProfilePicUrl";
import { FaSearch } from "react-icons/fa";
import { useSocketContext } from "../../Context/SocketContext";
import OnlineStatus from "../../Utils/OnlineStatus";
import FormatDate from "../../Utils/FormatDate";
import Truncate from "../../Utils/Truncate";
import truncateMsg from "../../Utils/TruncateMsg";
import { useAuthContext } from "../../Context/AuthContext";
import useMarkAsSeen from "../../Hooks/MessagesHooks/MarkAsSeen/useMarkAsSeen";

const ChatsForUser = ({ onSelectChat }) => {
  const [conversations, setConversations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { onlineUsers, newMessage, setNewMessage } = useSocketContext();
  const { authUser } = useAuthContext();
  const { markAsSeen } = useMarkAsSeen();

  useEffect(() => {
    fetchConversations();
  }, [conversations]);

  const fetchConversations = () => {
    getConversations()
      .then((response) => {
        if (response) {
          const filteredList = response.filter(
            (item) => item?.receiverName !== "Unknown"
          );
          setConversations(filteredList);
        } else {
          console.error("Conversations not found");
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-lg font-poppins">
        No conversations found.
      </div>
    );
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.receiverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLastMessageContent = (lastMessage) => {
    if (!lastMessage) return "";
    if (lastMessage.image) return "Sent a media file";
    return lastMessage.content;
  };

  const formatTime = (date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const today = new Date();

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  const handleSelectChat = async (conv) => {
    onSelectChat(conv);
    await markAsSeen(conv.id);
  };

  console.log("coneversations", conversations);

  return (
    <div className="h-full flex flex-col bg-background-dark font-poppins">
      <div className="relative mb-4">
        <input
          className="w-full px-4 py-3 text-body-sm bg-surface rounded-lg pr-10 focus:outline-none border border-surface-light text-text placeholder-text-muted"
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
      </div>

      <div className="space-y-1 h-[20rem] overflow-auto">
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            className="flex items-center border border-background-light p-3 rounded-lg cursor-pointer hover:bg-surface transition-colors duration-200 group"
            onClick={() => handleSelectChat(conv)}>
            <div className="relative flex-shrink-0">
              <img
                src={getProfilePicUrl(conv?.receiverPic)}
                alt={conv?.receiverName}
                className="h-12 w-12 rounded-full object-cover border-2 border-surface-light group-hover:border-primary-light transition-colors duration-200"
              />
              {OnlineStatus(conv?.receiverId, onlineUsers) && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-background"></div>
              )}
            </div>

            <div className="ml-4 flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h2 className="text-body-sm text-text  truncate">
                  {conv.receiverName}
                </h2>
                <span className="text-xs text-text-muted ml-2 flex-shrink-0">
                  {formatTime(conv.date)}
                </span>
              </div>

              <div className="flex justify-between items-center mt-1">
                <p
                  className={`text-body-xs ${
                    conv.unseenCount > 0 && "font-bold text-white"
                  } text-text-muted  truncate max-w-[80%]`}>
                  {conv.senderId === authUser?._id
                    ? `You: ${getLastMessageContent(conv.lastMessage)}`
                    : getLastMessageContent(conv.lastMessage)}
                </p>
                {conv.unseenCount > 0 && (
                  <div className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary-dark text-text text-xs font-medium flex-shrink-0">
                    {conv.unseenCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatsForUser;
