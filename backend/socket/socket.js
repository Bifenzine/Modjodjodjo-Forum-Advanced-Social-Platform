import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import config from "../config/config.js";

const app = express();
const server = http.createServer(app);
// previous cors options for socket not dynamic for web and mobile
// const io = new Server(server, {
//   cors: {
//     origin: config.frontendUrl,
//   },
// });

// new cors options for socket dynamic for web and mobile
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Get allowed origins based on client type
      const allowedOrigins = config.getAllowedOrigins();
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

const userSocketMap = {}; // {userId: {socketId, userData}}

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId]?.socketId;
};

export const sendNotification = async (recipientId, notification) => {
  try {
    const populatedNotification = await Notification.findById(notification._id)
      .populate("sender", "username fullName profilePic")
      .lean();

    io.to(`notification:${recipientId}`).emit(
      "newNotification",
      populatedNotification
    );
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

io.on("connection", async (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId;
  // client type
  const clientType = socket.handshake.query.clientType || "web"; // Get clientType from connection
  console.log("socket connected. Client Type:", clientType);

  // Get the appropriate frontend URL based on client type
  const frontendUrl = config.getFrontendUrl(clientType);
  console.log("Frontend URL:", frontendUrl);

  if (userId !== undefined) {
    try {
      const user = await User.findById(userId)
        .select("-password")
        .populate("following", "_id username fullName profilePic");
      if (user) {
        userSocketMap[userId] = {
          socketId: socket.id,
          userData: user,
        };

        socket.join(`notification:${userId}`);

        const onlineFriends = user.following
          .filter((friend) => userSocketMap[friend._id.toString()])
          .map((friend) => ({
            id: friend._id,
            username: friend.username,
            fullName: friend.fullName,
            profilePic: friend.profilePic,
          }));

        socket.emit("getOnlineFriends", onlineFriends);

        user.following.forEach((friend) => {
          const friendSocket = userSocketMap[friend._id.toString()]?.socketId;
          if (friendSocket) {
            io.to(friendSocket).emit("friendOnline", {
              id: user._id,
              username: user.username,
              fullName: user.fullName,
              profilePic: user.profilePic,
            });
          }
        });

        console.log("online friends", onlineFriends);

        io.emit(
          "getOnlineUsers",
          Object.values(userSocketMap).map((u) => u.userData)
        );
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }

  socket.on("joinClanRoom", (clanId) => {
    socket.join(clanId);
  });

  socket.on("leaveClanRoom", (clanId) => {
    socket.leave(clanId);
  });

  socket.on("deleteClanMessage", ({ messageId, clanId }) => {
    io.to(clanId).emit("clanMessageDeleted", { messageId, clanId });
  });

  socket.on("deleteUserMessage", ({ messageId, conversationId }) => {
    io.emit("userMessageDeleted", { messageId, conversationId });
  });

  socket.on("newMessage", (message) => {
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }
    io.to(socket.id).emit("newMessage", message);
  });

  // socket event for typing indicator for user interface
  socket.on("typingU", (receiverId) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typingU", socket.id);
    }
  });

  // socket event for typing indicator for clan interface
  socket.on("typing", ({ clanId, userId, username }) => {
    // Broadcast typing event to all users in the clan room except the sender
    socket.to(clanId).emit("typing", { userId, username, clanId });
  });

  // New socket events for post interactions
  socket.on("postUpvoted", (data) => {
    io.emit("postUpvoted", data);
  });

  socket.on("postDownvoted", (data) => {
    io.emit("postDownvoted", data);
  });

  socket.on("postShared", (data) => {
    io.emit("postShared", data);
  });

  // get the time thats passed since user was connected
  socket.on("getTime", () => {
    const userId = socket.handshake.query.userId;
    const user = userSocketMap[userId];
    if (user) {
      const currentTime = Date.now();
      const connectedTime = user.connectedTime || currentTime;
      const timePassed = currentTime - connectedTime;
      io.to(socket.id).emit("getTime", timePassed);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    const disconnectedUserId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key].socketId === socket.id
    );
    if (disconnectedUserId) {
      const disconnectedUser = userSocketMap[disconnectedUserId].userData;
      delete userSocketMap[disconnectedUserId];
      disconnectedUser.following.forEach((friend) => {
        const friendSocket = userSocketMap[friend._id.toString()]?.socketId;
        if (friendSocket) {
          io.to(friendSocket).emit("friendOffline", disconnectedUser._id);
        }
      });
      io.emit(
        "getOnlineUsers",
        Object.values(userSocketMap).map((u) => u.userData)
      );
    }
  });
});

export { app, server, io };
