import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";
import config from "../config/config";
import { formatTimePassed } from "../Utils/TimePassedSinceConnected";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [newMessage, setNewMessage] = useState(null);
  const [postUpdate, setPostUpdate] = useState(null);
  const [connectionTime, setConnectionTime] = useState(null);
  const { authUser } = useAuthContext();

  // Function to handle time updates
  const handleTimeUpdate = (time) => {
    setConnectionTime(time);
  };

  // Get formatted connection time
  const getFormattedConnectionTime = () => {
    return formatTimePassed(connectionTime);
  };

  useEffect(() => {
    if (authUser) {
      const socket = io(config.apiUrl, {
        query: { userId: authUser._id, clientType: "web" },
      });

      setSocket(socket);

      socket.on("connect", () => {
        socket.emit("joinNotificationRoom", authUser._id);
      });

      socket.on("getTime", handleTimeUpdate);

      // Request initial time
      socket.emit("getTime");

      // Set up interval to update time
      const timeInterval = setInterval(() => {
        socket.emit("getTime");
      }, 60000); // Update every minute instead of every second for production efficiency

      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      socket.on("getOnlineFriends", (friends) => {
        setOnlineFriends(friends);
      });

      socket.on("friendOnline", (friend) => {
        setOnlineFriends((prev) => [...prev, friend]);
      });

      socket.on("friendOffline", (friendId) => {
        setOnlineFriends((prev) => prev.filter((f) => f._id !== friendId));
      });

      socket.on("newClanMessage", ({ message, clanId }) => {
        console.log("New clan message received:", message, "for clan:", clanId);
      });

      socket.on("clanMessageDeleted", ({ messageId, clanId }) => {
        console.log("Clan message deleted:", messageId, "from clan:", clanId);
      });

      socket.on("userMessageDeleted", ({ messageId, conversationId }) => {
        console.log(
          "User message deleted:",
          messageId,
          "from conversation:",
          conversationId
        );
      });

      socket.on("newMessage", (message) => {
        setNewMessage(message);
      });

      // socket envent for typing
      socket.on("typing", (data) => {
        console.log("Typing event received:", data);
      });

      socket.on("typingU", (data) => {
        console.log("Typing event received:", data);
      });

      // New socket events for post interactions
      socket.on("postUpvoted", (data) => {
        setPostUpdate({ type: "upvote", ...data });
      });

      socket.on("postDownvoted", (data) => {
        setPostUpdate({ type: "downvote", ...data });
      });

      socket.on("postShared", (data) => {
        setPostUpdate({ type: "share", ...data });
      });

      return () => {
        clearInterval(timeInterval);
        socket.off("getTime");
        socket.off("connect");
        socket.off("getOnlineUsers");
        socket.off("getOnlineFriends");
        socket.off("friendOnline");
        socket.off("friendOffline");
        socket.off("newClanMessage");
        socket.off("clanMessageDeleted");
        socket.off("userMessageDeleted");
        socket.off("newMessage");
        socket.off("postUpvoted");
        socket.off("postDownvoted");
        socket.off("postShared");
        socket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        onlineFriends,
        newMessage,
        setNewMessage,
        postUpdate,
        connectionTime,
        getFormattedConnectionTime,
      }}>
      {children}
    </SocketContext.Provider>
  );
};
