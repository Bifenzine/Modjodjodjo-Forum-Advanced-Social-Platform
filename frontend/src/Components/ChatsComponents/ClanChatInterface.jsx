import React, { useState, useRef, useEffect } from "react";
import {
  FaArrowLeft,
  FaEllipsisV,
  FaTelegramPlane,
  FaTrash,
} from "react-icons/fa";
import { Button } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import ImagePicker from "../ImagePicker/ImagePicker";
import formatMessageDate from "../../Utils/FormatMessageDate";
import getProfilePicUrl from "../../Utils/GetProfilePicUrl";
import { useAuthContext } from "../../Context/AuthContext";
import { useSocketContext } from "../../Context/SocketContext";
import { getClanMessages } from "../../DataFetching/DataFetching";
import useSendClanToMessage from "../../Hooks/MessagesHooks/ClanMessagesHooks/useSendMessageToClan";
import useDeleteMessageFromClan from "../../Hooks/MessagesHooks/ClanMessagesHooks/useDeleteMessageFromClan";
import getHowManyClanUsersOnline from "../../Utils/getHowManyClanUsersOnline";
import clanMemberCount from "../../Utils/clanMemberCount";
import { Loader } from "lucide-react";
import { useInView } from "react-intersection-observer";
import displayMedia from "../../Utils/displayMediaBasedOnExtension";
import MediaViewerModal from "../ImageViewer/MediaViewerModal";

const ClanChatInterface = ({ chat, onBack }) => {
  const [message, setMessage] = useState("");
  const [msgImage, setMsgImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const [clearPreview, setClearPreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { authUser } = useAuthContext();
  const { onlineUsers, socket } = useSocketContext();
  const { sendMessageToClan, loadingMsg } = useSendClanToMessage();
  const { deleteMessageFromClan, loading } = useDeleteMessageFromClan();

  const typingTimeoutRef = useRef({});
  const fileInputRef = useRef(null);
  const messageContainerRef = useRef(null);
  const lastScrollHeightRef = useRef(0);
  const lastScrollTopRef = useRef(0);

  // Create ref for intersection observer
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (initialLoad) {
      fetchInitialMessages();
      setupSocketListeners();
    }
    return () => cleanupSocketListeners();
  }, [chat.clanId, socket]);

  useEffect(() => {
    if (inView && hasMore && !isLoading && !initialLoad) {
      loadMoreMessages();
    }
  }, [inView]);

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [messages, shouldScrollToBottom]);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  const isNearBottom = () => {
    if (!messageContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } =
      messageContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  const handleTyping = () => {
    if (socket && message.trim()) {
      socket.emit("typing", {
        clanId: chat.clanId,
        userId: authUser._id,
        username: authUser.username,
      });
    }
  };

  const fetchInitialMessages = async () => {
    try {
      setIsLoading(true);
      const response = await getClanMessages(chat.clanId, 1);
      setMessages(response.messages);
      setHasMore(response.hasMore);
      setInitialLoad(false);
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error("Error fetching initial messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      setShouldScrollToBottom(false);

      // Store current scroll position before loading
      if (messageContainerRef.current) {
        lastScrollHeightRef.current = messageContainerRef.current.scrollHeight;
        lastScrollTopRef.current = messageContainerRef.current.scrollTop;
      }

      const nextPage = page + 1;
      const response = await getClanMessages(chat.clanId, nextPage);

      // Keep existing messages visible while loading new ones
      setMessages((prevMessages) => [...response.messages, ...prevMessages]);
      setHasMore(response.hasMore);
      setPage(nextPage);

      // Restore scroll position after new messages are loaded
      requestAnimationFrame(() => {
        if (messageContainerRef.current) {
          const newScrollHeight = messageContainerRef.current.scrollHeight;
          const scrollDiff = newScrollHeight - lastScrollHeightRef.current;
          messageContainerRef.current.scrollTop =
            lastScrollTopRef.current + scrollDiff;
        }
      });
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.emit("joinClanRoom", chat.clanId);
    socket.on("newClanMessage", handleNewMessage);
    socket.on("clanMessageDeleted", handleDeletedMessage);
    socket.on("typing", ({ userId, username, clanId }) => {
      if (clanId === chat.clanId && userId !== authUser._id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.add(username);
          return newSet;
        });

        // Clear typing indicator after 3 seconds
        if (typingTimeoutRef.current[userId]) {
          clearTimeout(typingTimeoutRef.current[userId]);
        }
        typingTimeoutRef.current[userId] = setTimeout(() => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(username);
            return newSet;
          });
        }, 3000);
      }
    });
  };

  const cleanupSocketListeners = () => {
    if (!socket) return;

    socket.emit("leaveClanRoom", chat.clanId);
    socket.off("newClanMessage");
    socket.off("clanMessageDeleted");
    socket.off("typing");

    // Clear all typing timeouts
    Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    typingTimeoutRef.current = {};
  };

  const handleNewMessage = ({ message, clanId }) => {
    if (clanId === chat.clanId) {
      const nearBottom = isNearBottom();
      setShouldScrollToBottom(nearBottom);
      setMessages((prevMessages) => [...prevMessages, message]);
      // Clear typing indicator for the user who sent the message
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(message.senderId.username);
        return newSet;
      });
    }
  };

  const handleDeletedMessage = ({ messageId, clanId }) => {
    if (clanId === chat.clanId) {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !msgImage) return;

    const formData = new FormData();
    formData.append("content", message.trim());
    if (msgImage) formData.append("image", msgImage);

    try {
      const newMessage = await sendMessageToClan(formData, chat.clanId);
      if (newMessage && socket) {
        socket.emit("newClanMessage", {
          message: newMessage,
          clanId: chat.clanId,
        });
      }
      setMessage("");
      setMsgImage(null);
      setClearPreview(true);
      setShouldScrollToBottom(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
    if (clearPreview) {
      setClearPreview(false);
    }
  }, [clearPreview]);

  const handleDelete = async (msgId) => {
    try {
      await deleteMessageFromClan(msgId, chat.clanId);
      if (socket) {
        socket.emit("deleteClanMessage", {
          messageId: msgId,
          clanId: chat.clanId,
        });
      }
    } catch (error) {
      console.error("Failed to delete clan message:", error);
    }
  };

  const renderHeader = () => (
    <div className="flex items-center p-2 bg-background">
      <button onClick={onBack} className="mr-2 text-white">
        <FaArrowLeft />
      </button>
      <Link to={`/Clans/clan/${chat.clanId}`}>
        <img
          src={getProfilePicUrl(chat.bannerImage)}
          alt={chat.name}
          className="h-10 w-10 rounded-full object-cover"
        />
      </Link>
      <div className="ml-4 flex-1">
        <Link to={`/Clans/clan/${chat.clanId}`}>
          <h2 className="font-semibold">{chat.name}</h2>
        </Link>
        <div className="flex flex-col">
          <span className="text-sm">
            <span className="text-slate-400">
              {clanMemberCount(chat)} members,{" "}
            </span>
            <span className="text-green-400">
              {getHowManyClanUsersOnline(chat, onlineUsers)} online
            </span>
          </span>
          {typingUsers.size > 0 && (
            <span className="text-xs text-gray-400 italic">
              {Array.from(typingUsers).join(", ")}{" "}
              {typingUsers.size === 1 ? "is" : "are"} typing...
            </span>
          )}
        </div>
      </div>
      <FaEllipsisV className="text-white" />
    </div>
  );

  const renderMessage = (msg) => {
    const isCurrentUser = msg.senderId?._id === authUser?._id;
    return (
      <div
        key={msg._id}
        className={`flex flex-col ${
          isCurrentUser ? "items-end" : "items-start"
        } space-y-1`}>
        <div
          className={`flex items-center gap-2 ${
            isCurrentUser ? "flex-row-reverse" : "flex-row"
          } space-x-2`}>
          <Link to={`/profile/${msg.senderId?._id}`}>
            <img
              src={getProfilePicUrl(msg.senderId?.profilePic)}
              alt={msg.senderId?.username}
              className="w-6 h-6 rounded-full object-cover"
            />
          </Link>
          <span className="text-sm text-gray-400">
            {msg.senderId?.username}
          </span>
        </div>
        <div
          className={`${
            isCurrentUser
              ? "bg-primary-dark"
              : "bg-gray-800 border border-primary-dark"
          } p-2 rounded-lg text-white max-w-[70%] relative break-all`}
          onClick={() =>
            isCurrentUser &&
            setSelectedMessage(selectedMessage === msg._id ? null : msg._id)
          }>
          {loading && <Loader className="w-5 h-5 animate-spin mx-auto" />}
          {msg.content && <p className="mb-2">{msg.content}</p>}
          {msg.image && (
            <div
              className="max-w-full h-auto rounded cursor-pointer"
              onClick={() => setSelectedImage(msg?.image)}>
              {displayMedia(msg?.image, "media content", true)}
            </div>
          )}
          {isCurrentUser && selectedMessage === msg._id && (
            <FaTrash
              className="absolute right-full mr-2 top-0 text-red-400 cursor-pointer"
              onClick={() => handleDelete(msg._id)}
            />
          )}
        </div>
        <span className="text-xs text-gray-400">
          {formatMessageDate(msg.createdAt)}
        </span>
        {selectedImage && (
          <MediaViewerModal
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            mediaUrl={selectedImage}
            onDelete={() => {
              handleDelete(msg?._id);
              setSelectedImage(null);
            }}
            isCurrentUser={isCurrentUser}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[26rem]">
      {renderHeader()}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto bg-background-dark p-4 space-y-2">
        {isLoading && initialLoad ? (
          <p className="text-center text-gray-400">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400">
            Be the first to start a conversation in {chat.name} chat room 🙃
          </p>
        ) : (
          <>
            {hasMore && (
              <div ref={loadMoreRef} className="text-center py-2">
                {isLoading && !initialLoad && (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    <p className="text-gray-400">Loading more messages...</p>
                  </div>
                )}
              </div>
            )}
            {messages.map(renderMessage)}
          </>
        )}
      </div>
      <form className="flex w-full" onSubmit={handleSubmit}>
        <div className="flex justify-center h-full w-full items-center p-2 bg-slate-950 rounded-md shadow-lg">
          <ImagePicker
            fileInputRef={fileInputRef}
            handleBtnClick={() => fileInputRef.current?.click()}
            handleFileChange={(e) => setMsgImage(e.target.files[0])}
            cancelPost={() => {
              if (fileInputRef.current) fileInputRef.current.value = "";
              setMsgImage(null);
            }}
            clearPreview={clearPreview}
          />
          <input
            className="flex-grow py-2 px-3 bg-slate-950 focus:outline-none rounded-full text-gray-600 min-w-0"
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
          />
          <Button
            type="submit"
            className="bg-primary text-white p-2 rounded-full focus:outline-none"
            disabled={loadingMsg}>
            {loadingMsg ? (
              <Loader className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <FaTelegramPlane />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClanChatInterface;
