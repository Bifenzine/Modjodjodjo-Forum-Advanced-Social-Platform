import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "./AuthContext";
import { useSocketContext } from "./SocketContext";
import toast from "react-hot-toast";
import config from "../config/config";

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { authUser } = useAuthContext();
  const { socket } = useSocketContext();

  const [userChats, setUserChats] = useState([]);
  const [clanChats, setClanChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authUser) {
      fetchUserChats();
      fetchClanChats();
    }
  }, [authUser]);

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", handleNewMessage);
      socket.on("messageDeleted", handleMessageDeleted);
      socket.on("newClanMessage", handleNewClanMessage);
      socket.on("clanMessageDeleted", handleClanMessageDeleted);

      return () => {
        socket.off("newMessage");
        socket.off("messageDeleted");
        socket.off("newClanMessage");
        socket.off("clanMessageDeleted");
      };
    }
  }, [socket]);

  const fetchUserChats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.apiUrl}/api/conversations`);
      setUserChats(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch user chats");
      toast.error("Failed to fetch user chats");
      setLoading(false);
    }
  };

  const fetchClanChats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.apiUrl}/messages/Clans`);
      setClanChats(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch clan chats");
      toast.error("Failed to fetch clan chats");
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId, isClan = false) => {
    try {
      setLoading(true);
      let response;
      if (isClan) {
        response = await axios.get(
          `${config.apiUrl}/messages/Clans/${chatId}/messages`
        );
      } else {
        response = await axios.get(
          `${config.apiUrl}/messages/conversation/${chatId}`
        );
      }
      setMessages(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch messages");
      toast.error("Failed to fetch messages");
      setLoading(false);
    }
  };

  const sendMessage = async (chatId, content, image, isClan = false) => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) formData.append("image", image);

      let response;
      if (isClan) {
        response = await axios.post(
          `${config.apiUrl}/messages/Clans/${chatId}/messages`,
          formData
        );
      } else {
        response = await axios.post(
          `${config.apiUrl}/messages/send/${chatId}`,
          formData
        );
      }

      setMessages((prev) => [...prev, response.data]);

      if (isClan) {
        setClanChats((prev) =>
          prev.map((chat) =>
            chat.clanId === chatId
              ? {
                  ...chat,
                  lastMessage: {
                    content: response.data.content,
                    createdAt: response.data.createdAt,
                  },
                }
              : chat
          )
        );
      } else {
        setUserChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  lastMessage: response.data.content,
                  date: response.data.createdAt,
                }
              : chat
          )
        );
      }

      return response.data;
    } catch (err) {
      setError("Failed to send message");
      toast.error("Failed to send message");
    }
  };

  const deleteMessage = async (messageId, isClan = false, clanId = null) => {
    try {
      if (isClan) {
        await axios.delete(
          `${config.apiUrl}/messages/Clans/${clanId}/messages/${messageId}`
        );
      } else {
        await axios.delete(`${config.apiUrl}/messages/${messageId}`);
      }
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      toast.success("Message deleted successfully");
    } catch (err) {
      setError("Failed to delete message");
      toast.error("Failed to delete message");
    }
  };

  const handleNewMessage = (data) => {
    const { message, conversationId } = data;
    if (activeChat && activeChat.id === conversationId) {
      setMessages((prev) => [...prev, message]);
    }
    setUserChats((prev) =>
      prev.map((chat) =>
        chat.id === conversationId
          ? { ...chat, lastMessage: message.content, date: message.createdAt }
          : chat
      )
    );
  };

  const handleMessageDeleted = (data) => {
    const { messageId, conversationId } = data;
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
  };

  const handleNewClanMessage = (data) => {
    const { message, clanId } = data;
    if (activeChat && activeChat.clanId === clanId) {
      setMessages((prev) => [...prev, message]);
    }
    setClanChats((prev) =>
      prev.map((chat) =>
        chat.clanId === clanId
          ? {
              ...chat,
              lastMessage: {
                content: message.content,
                createdAt: message.createdAt,
              },
            }
          : chat
      )
    );
  };

  const handleClanMessageDeleted = (data) => {
    const { messageId, clanId } = data;
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
  };

  const value = {
    userChats,
    clanChats,
    activeChat,
    setActiveChat,
    messages,
    loading,
    error,
    fetchUserChats,
    fetchClanChats,
    fetchMessages,
    sendMessage,
    deleteMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
