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
import { getMessages } from "../../DataFetching/DataFetching";
import useSendMessage from "../../Hooks/MessagesHooks/useSendMessage";
import useDeleteMessage from "../../Hooks/MessagesHooks/useDeleteMessage";
import { Loader } from "lucide-react";
import { useInView } from "react-intersection-observer";
import displayMedia from "../../Utils/displayMediaBasedOnExtension";
import MediaViewerModal from "../ImageViewer/MediaViewerModal";

const TypingIndicator = () => (
  <div className="flex space-x-1">
    <div
      className="w-2 h-2 rounded-full bg-primary animate-bounce"
      style={{ animationDelay: "0ms" }}></div>
    <div
      className="w-2 h-2 rounded-full bg-primary animate-bounce"
      style={{ animationDelay: "150ms" }}></div>
    <div
      className="w-2 h-2 rounded-full bg-primary animate-bounce"
      style={{ animationDelay: "300ms" }}></div>
  </div>
);

const ChatInterface = ({ chat, onBack }) => {
  const [message, setMessage] = useState("");
  const [msgImage, setMsgImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [clearPreview, setClearPreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const { authUser } = useAuthContext();
  const { onlineUsers, socket, getFormattedConnectionTime } =
    useSocketContext();
  const { sendMessage, loadingMsg } = useSendMessage();
  const { deleteMessage, loading } = useDeleteMessage();

  const lastScrollHeightRef = useRef(0);
  const lastScrollTopRef = useRef(0);
  const messageContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    fetchInitialMessages();
    setupSocketListeners();
    return () => cleanupSocketListeners();
  }, [chat.id, socket]);

  useEffect(() => {
    if (initialLoad) {
      fetchInitialMessages();
    }
  }, [chat.id]);

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [messages, shouldScrollToBottom]);

  useEffect(() => {
    if (inView && hasMore && !isLoading && !initialLoad) {
      loadMoreMessages();
    }
  }, [inView]);

  useEffect(() => {
    if (clearPreview) {
      setClearPreview(false);
    }
  }, [clearPreview]);

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

  const fetchInitialMessages = async () => {
    try {
      setIsLoading(true);
      const response = await getMessages(chat.id, 1);
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

      // Store current scroll position
      if (messageContainerRef.current) {
        lastScrollHeightRef.current = messageContainerRef.current.scrollHeight;
        lastScrollTopRef.current = messageContainerRef.current.scrollTop;
      }

      const nextPage = page + 1;
      const response = await getMessages(chat.id, nextPage);

      setMessages((prev) => [...response.messages, ...prev]);
      setHasMore(response.hasMore);
      setPage(nextPage);

      // Restore scroll position after messages load
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

    socket.on("newMessage", handleNewMessage);
    socket.on("userMessageDeleted", handleDeletedMessage);
    socket.on("typingU", (socketId) => {
      if (socketId !== socket.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });
  };

  const cleanupSocketListeners = () => {
    if (!socket) return;

    socket.off("newMessage", handleNewMessage);
    socket.off("userMessageDeleted", handleDeletedMessage);
    socket.off("typingU");
  };

  const handleNewMessage = ({ message, conversationId }) => {
    if (conversationId === chat.id) {
      const nearBottom = isNearBottom();
      setShouldScrollToBottom(nearBottom);

      setMessages((prevMessages) => {
        const messageExists = prevMessages.some(
          (msg) => msg._id === message._id
        );
        if (!messageExists) {
          const isCurrentUserSender = message.senderId._id === authUser._id;
          const updatedMessage = {
            ...message,
            senderId: isCurrentUserSender ? authUser : message.senderId,
          };
          return [...prevMessages, updatedMessage];
        }
        return prevMessages;
      });
    }
  };

  const handleDeletedMessage = ({ messageId, conversationId }) => {
    if (conversationId === chat.id) {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
    }
  };

  const handleTyping = () => {
    if (!socket) return;

    if (typingTimeout) clearTimeout(typingTimeout);

    socket.emit("typingU", chat.receiverId);

    const timeout = setTimeout(() => {
      setTypingTimeout(null);
    }, 2000);

    setTypingTimeout(timeout);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    handleTyping();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !msgImage) return;

    const formData = new FormData();
    formData.append("content", message.trim());
    if (msgImage) formData.append("image", msgImage);

    try {
      await sendMessage(formData, chat.receiverId);
      setMessage("");
      setMsgImage(null);
      setClearPreview(true);
      setShouldScrollToBottom(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleDelete = async (msgId) => {
    try {
      await deleteMessage(msgId, chat.id);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const renderHeader = () => (
    <div className="flex items-center p-2 bg-background">
      <button onClick={onBack} className="mr-2 text-white">
        <FaArrowLeft />
      </button>
      <Link to={`/profile/${chat.receiverId}`}>
        <img
          src={getProfilePicUrl(chat.receiverPic)}
          alt={chat.receiverName}
          className="h-10 w-10 rounded-full object-cover"
        />
      </Link>
      <div className="ml-4 flex-1">
        <Link to={`/profile/${chat.receiverId}`}>
          <h2 className="font-semibold">{chat.receiverName}</h2>
        </Link>
        <div className="flex items-center space-x-2">
          <span className="text-sm">
            {onlineUsers.some((user) => user._id === chat.receiverId) ? (
              <span className="text-green-400">Online</span>
            ) : (
              <span className="text-gray-400">
                {getFormattedConnectionTime()}
              </span>
            )}
          </span>
          {isTyping && <span className="text-sm text-primary">typing...</span>}
        </div>
      </div>
      <FaEllipsisV className="text-white" />
    </div>
  );

  const renderMessage = (msg) => {
    const isCurrentUser = msg.senderId._id === authUser._id;
    return (
      <div
        key={msg._id}
        className={`flex flex-col ${
          isCurrentUser ? "items-end" : "items-start"
        } space-y-1`}>
        <div
          className={`${
            isCurrentUser
              ? "bg-primary-dark "
              : "bg-gray-800 border border-primary-dark"
          } p-2 rounded-lg text-white max-w-[70%] relative break-all`}
          onClick={() =>
            isCurrentUser &&
            setSelectedMessage(selectedMessage === msg._id ? null : msg._id)
          }>
          <>
            {loading && <Loader className="w-5 h-5 animate-spin mx-auto" />}
            {msg.content && <p className="mb-2">{msg.content}</p>}
            {msg.image && (
              <div
                className="max-w-full h-auto rounded cursor-pointer"
                onClick={() => setSelectedImage(msg?.image)}>
                {displayMedia(msg?.image, "media content", true)}
              </div>
            )}
          </>

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
            Start a conversation with {chat.receiverName} 🙃
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
            {isTyping && (
              <div className="flex items-start space-y-1">
                <div className="bg-gray-800 border border-primary-dark p-2 rounded-lg">
                  <TypingIndicator />
                </div>
              </div>
            )}
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
            onChange={handleMessageChange}
          />
          <Button
            type="submit"
            className="bg-primary text-white p-2 rounded-full focus:outline-none"
            disabled={loadingMsg}>
            {loadingMsg ? (
              <Loader className="animate-spin w-5 h-5 mx-auto" />
            ) : (
              <FaTelegramPlane />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
