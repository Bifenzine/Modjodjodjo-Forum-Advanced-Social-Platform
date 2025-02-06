import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { getUserClanChats } from "../../DataFetching/DataFetching";
import getProfilePicUrl from "../../Utils/GetProfilePicUrl";
import formatMessageDate from "../../Utils/FormatMessageDate";
import FormatDate from "../../Utils/FormatDate";
import truncateUsername from "../../Utils/Truncate";
import truncateMsg from "../../Utils/TruncateMsg";
import { useAuthContext } from "../../Context/AuthContext";
import useMarkClanMessagesAsRead from "../../Hooks/MessagesHooks/ClanMessagesHooks/useMarkClanMessagesAsRead";

const ChatsForClans = ({ onSelectChat }) => {
  const { authUser } = useAuthContext();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { MarkClanMessagesAsRead } = useMarkClanMessagesAsRead();

  useEffect(() => {
    getUserClanChats()
      .then((response) => {
        if (response) {
          setChats(response);
          console.log(response);
        } else {
          console.error("Clans Chats not found");
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [chats]);

  const handleSelectChat = async (clanId, msg) => {
    onSelectChat(msg);
    await MarkClanMessagesAsRead(clanId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  if (!chats || chats.length === 0) {
    return <div className="text-center py-4">No conversations found.</div>;
  }

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLastMessageContent = (lastMessage) => {
    console.log("lastMessage", lastMessage);
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
        {loading && <p className="text-center text-gray-400">Loading...</p>}
        {filteredChats?.length === 0 && (
          <p className="text-center text-gray-400">
            You are not part of any clans
          </p>
        )}

        {filteredChats.map((msg) => (
          <div
            key={msg.id}
            className="flex items-center border border-background-light p-3 rounded-lg cursor-pointer hover:bg-surface transition-colors duration-200 group"
            onClick={() => handleSelectChat(msg?.clanId, msg)}>
            <img
              src={getProfilePicUrl(msg.bannerImage)}
              alt={msg.name}
              className="h-12 w-12 rounded-full object-cover border-2 border-surface-light group-hover:border-primary-light transition-colors duration-200"
            />
            <div className="relative ml-4 flex-1">
              <div className="flex justify-between">
                <h2 className="text-body-sm text-text  truncate">
                  {truncateUsername(msg.name)}
                </h2>
                <span className="text-xs text-text-muted ml-2 flex-shrink-0">
                  {formatTime(msg?.lastMessage?.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p
                  className={`text-body-xs ${
                    msg.unseenMessagesCount > 0 && "font-bold text-white"
                  } text-text-muted  truncate max-w-[80%]`}>
                  {msg?.lastMessageSenderId === authUser?._id
                    ? `You: ${getLastMessageContent(msg?.lastMessage)}`
                    : msg?.lastMessage?.sender?.username
                    ? `${
                        msg?.lastMessage?.sender?.username
                      }  :  ${getLastMessageContent(msg?.lastMessage)}`
                    : getLastMessageContent(msg?.lastMessage)}
                </p>
              </div>
              {msg.unseenMessagesCount > 0 && (
                <div className="absolute -bottom-1 right-2 ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary-dark text-text text-xs font-medium flex-shrink-0">
                  {msg.unseenMessagesCount}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatsForClans;
