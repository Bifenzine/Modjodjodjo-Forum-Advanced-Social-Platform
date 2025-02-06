import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import Clan from "../models/clan.model.js";
import Notification from "../models/notification.model.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Types } from "mongoose";
import { getReceiverSocketId, io, sendNotification } from "../socket/socket.js";
import dotenv from "dotenv";
import { cloudinary } from "../Storage/Cloudinary.config.js";
import { setEngine } from "crypto";

dotenv.config();
// cloudinary trigger in production env
const useCloudinary = process.env.NODE_ENV === "production";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dirname = path.resolve();

export const sendMessage = async (req, res) => {
  const senderId = req.user._id;
  const { receiverId } = req.params;
  const { content } = req.body;

  //   config for multer local storage
  //   let image = "";

  //   if (req.file && req.file.path) {
  //     image = req.file.path.replace(/\\/g, "/");
  //   }

  //   new config for cloudinary storage in prod and multer for dev env
  let image = "";
  if (req.file && req.file.path) {
    image = useCloudinary ? req.file.path.replace(/\\/g, "/") : req.file.path;
  }

  try {
    const messageData = {
      senderId,
      receiverId,
      // added this for vue feature
      seen: false,
    };

    if (content) {
      messageData.content = content;
    }

    if (image) {
      messageData.image = image;
    }

    const newMessage = new Message(messageData);
    const message = await newMessage.save();

    const populatedMessage = await Message.findById(message._id).populate(
      "senderId"
    );

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        messages: [message._id],
      });
    } else {
      conversation.messages.push(message._id);
    }

    await conversation.save();

    // Create a notification for the receiver
    const notification = await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: "direct_message",
      message: message._id,
      content: `${req.user.username} sent you a message`,
      notifContenu: message?.content || "",
    });

    sendNotification(receiverId, notification);

    // Socket.io logic
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        message: populatedMessage,
        conversationId: conversation._id,
      });
    }
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", {
        message: populatedMessage,
        conversationId: conversation._id,
      });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 10 } = req.query; // Default 20 messages per page

  try {
    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Get total count of messages
    const totalMessages = conversation.messages.length;

    // Get paginated messages with population
    const messages = await Conversation.findById(conversationId).populate({
      path: "messages",
      populate: {
        path: "senderId receiverId",
        select: "username profilePic",
      },
      options: {
        sort: { createdAt: -1 }, // Sort by newest first
        skip: skip,
        limit: parseInt(limit),
      },
    });

    res.status(200).json({
      messages: messages.messages.reverse(), // Reverse to show oldest first
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalMessages / parseInt(limit)),
      hasMore: skip + messages.messages.length < totalMessages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateMessage = async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Forbidden - You are not the author of this message" });
    }

    // const updateMessageData = { ...req.body };

    // config for multer local storage
    // if (message.image) {
    //     const imagePath = message.image;
    //     try {
    //       await fs.unlink(imagePath);
    //     } catch (err) {
    //       console.error("Error deleting old image:", err);
    //     }
    //   }

    // if (!req.file) {
    //     updateMessageData.image = "";
    //   } else {
    //     const filePath = req.file.path.replace(/\\/g, "/");
    //     updateMessageData.image = filePath;
    //   }

    // config for cloudinary storage in prod and multer for dev env
    const updateMessageData = { ...req.body };

    if (message.image) {
      if (useCloudinary) {
        try {
          // Extract public_id directly from the URL
          const regex = /\/modjo\/([^/]+)\.\w+$/;
          const match = message.image.match(regex);
          if (match && match[1]) {
            const public_id = `modjo/${match[1]}`;
            console.log(
              "Attempting to delete message image in update controller with public_id:",
              public_id
            );
            const isVideo =
              message.image.includes("/video/upload/") ||
              ["mp4", "webm"]?.includes(match[2]?.toLowerCase());

            console.log(
              `Attempting to delete ${
                isVideo ? "video" : "image"
              } with public_id:`,
              public_id
            );
            const result = await cloudinary.uploader.destroy(public_id, {
              resource_type: isVideo ? "video" : "image",
            });
            console.log("Cloudinary message image deletion result:", result);
          }
        } catch (err) {
          console.error("Error deleting old photo:", err);
        }
      } else {
        const imagePath = message.image;
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
      updateMessageData.image = "";
    }

    if (req.file) {
      console.log("New file detected:", req.file);
      if (useCloudinary) {
        updateMessageData.image = req.file.path; // This should be the Cloudinary URL
      } else {
        // For local storage, we need to update the path
        updateMessageData.image = req.file.path.replace(/\\/g, "/");
      }
      console.log("New image path:", updateMessageData.image);
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      updateMessageData,
      { new: true }
    );

    res.json(updatedMessage);
  } catch (error) {
    console.error("Error updating message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Forbidden - You are not the author of this message" });
    }

    // Image deletion logic
    if (message.image) {
      if (useCloudinary) {
        try {
          const regex = /\/modjo\/([^/]+)\.\w+$/;
          const match = message.image.match(regex);
          if (match && match[1]) {
            const public_id = `modjo/${match[1]}`;
            console.log(
              "Attempting to delete message image in delete controller with public_id:",
              public_id
            );
            const isVideo =
              message.image.includes("/video/upload/") ||
              ["mp4", "webm"]?.includes(match[2]?.toLowerCase());

            console.log(
              `Attempting to delete ${
                isVideo ? "video" : "image"
              } with public_id:`,
              public_id
            );
            const result = await cloudinary.uploader.destroy(public_id, {
              resource_type: isVideo ? "video" : "image",
            });
            console.log("Cloudinary message image deletion result:", result);
          }
        } catch (err) {
          console.error("Error deleting image from Cloudinary:", err);
        }
      } else {
        try {
          await fs.unlink(message.image);
        } catch (err) {
          console.error("Error deleting image file:", err);
        }
      }
    }

    const deletedMessage = await Message.findByIdAndDelete(messageId);

    const conversation = await Conversation.findOneAndUpdate(
      { messages: messageId },
      { $pull: { messages: messageId } },
      { new: true }
    );

    // Emit socket event for message deletion
    if (conversation) {
      io.emit("userMessageDeleted", {
        messageId: deletedMessage._id,
        conversationId: conversation._id,
      });
    }

    res.json(deletedMessage);
  } catch (error) {
    console.error("Error deleting message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createClanMessage = async (req, res) => {
  const senderId = req.user._id;
  const { ClanId } = req.params;
  const { content } = req.body;

  // config for multer local storage
  //   let image = "";
  //   if (req.file && req.file.path) {
  //     image = req.file.path.replace(/\\/g, "/");
  //   }

  // config for cloudinary storage in prod and multer for dev env
  let image = "";
  if (req.file && req.file.path) {
    image = useCloudinary ? req.file.path : req.file.path.replace(/\\/g, "/");
  }

  try {
    const clan = await Clan.findOne({
      _id: ClanId,
      $or: [
        { members: senderId },
        { moderators: senderId },
        { admins: senderId },
      ],
    });
    if (!clan) {
      return res.status(403).json({
        error: "You are not authorized to send messages to this clan",
      });
    }
    const messageData = {
      senderId,
      clan: ClanId,
    };
    if (content) {
      messageData.content = content;
    }
    if (image) {
      messageData.image = image;
    }
    const newMessage = new Message(messageData);
    const message = await newMessage.save();
    const populatedMessage = await Message.findById(message._id).populate(
      "senderId"
    );
    clan.messages.push(message._id);
    await clan.save();

    // Create notifications for all clan members except the sender
    const clanMembers = [...clan.members, ...clan.moderators, ...clan.admins];
    const notifications = await Promise.all(
      clanMembers
        .filter((memberId) => !memberId.equals(senderId))
        .map(async (memberId) => {
          const notification = await Notification.create({
            recipient: memberId,
            sender: senderId,
            type: "clan_message",
            clan: ClanId,
            message: message._id,
            content: `${req.user.username} posted a message in ${clan.name}`,
            notifContenu: message?.content || "",
          });
          return notification;
        })
    );

    notifications.forEach((notification) => {
      sendNotification(notification.recipient, notification);
    });

    // Emit the new message to all members of the clan
    io.to(ClanId).emit("newClanMessage", {
      message: populatedMessage,
      clanId: ClanId,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending clan message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateClanMessage = async (req, res) => {
  const { ClanId, MessageId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  try {
    const message = await Message.findById(MessageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if the logged-in user is authorized to update the message
    const clan = await Clan.findById(ClanId);
    const isAuthor = message.senderId.toString() === userId.toString();
    const isAdmin = clan.admins.some(
      (adminId) => adminId.toString() === userId.toString()
    );
    const isMod = clan.moderators.some(
      (modId) => modId.toString() === userId.toString()
    );

    if (!isAuthor && !isAdmin && !isMod) {
      return res.status(403).json({
        error: "Forbidden - You are not authorized to update this message",
      });
    }

    // config cloudinary storage in prod and multer for dev env
    // Update message content and image path
    const updateMessageData = { ...req.body };
    if (message.image) {
      if (useCloudinary) {
        try {
          // Extract public_id directly from the URL
          const regex = /\/modjo\/([^/]+)\.\w+$/;
          const match = message.image.match(regex);
          if (match && match[1]) {
            const public_id = `modjo/${match[1]}`;
            console.log(
              "Attempting to delete clan image message in update controller with public_id:",
              public_id
            );
            const isVideo =
              message.image.includes("/video/upload/") ||
              ["mp4", "webm"]?.includes(match[2]?.toLowerCase());

            console.log(
              `Attempting to delete ${
                isVideo ? "video" : "image"
              } with public_id:`,
              public_id
            );
            const result = await cloudinary.uploader.destroy(public_id, {
              resource_type: isVideo ? "video" : "image",
            });
            console.log(
              "Cloudinary clan image message deletion result:",
              result
            );
          }
        } catch (err) {
          console.error(
            "Error deleting old photo in update clan message:",
            err
          );
        }
      } else {
        const imagePath = path.join(dirname, message.image);
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
      updateMessageData.image = "";
    }

    if (req.file) {
      console.log("New file detected:", req.file);
      if (useCloudinary) {
        updateMessageData.image = req.file.path; // This should be the Cloudinary URL
      } else {
        // For local storage, we need to update the path
        updateMessageData.image = req.file.path.replace(/\\/g, "/");
      }
      console.log("New image path:", updateReplyData.photo);
    }

    // Handle image updates and deletions in dev env
    // if (message.image) {
    //   const imagePath = path.join(dirname, message.image);
    //   try {
    //     await fs.unlink(imagePath);
    //   } catch (err) {
    //     console.error("Error deleting old image:", err);
    //   }
    // }

    // Update message content and image path

    // const updateMessageData = { ...req.body };
    // if (!req.file) {
    //   updateMessageData.image = "";
    // } else {
    //   const filePath = req.file.path.replace(/\\/g, "/");
    //   updateMessageData.image = filePath;
    // }

    const updatedMessage = await Message.findByIdAndUpdate(
      MessageId,
      updateMessageData,
      { new: true }
    );

    res.json(updatedMessage);
  } catch (error) {
    console.error("Error updating clan message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteClanMessage = async (req, res) => {
  const { ClanId, MessageId } = req.params;
  const userId = req.user._id;

  try {
    const message = await Message.findById(MessageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if the logged-in user is authorized to delete the message
    const clan = await Clan.findById(ClanId);
    const isAuthor = message.senderId.toString() === userId.toString();
    const isAdmin = clan.admins.some(
      (adminId) => adminId.toString() === userId.toString()
    );
    const isMod = clan.moderators.some(
      (modId) => modId.toString() === userId.toString()
    );

    if (!isAuthor && !isAdmin && !isMod) {
      return res.status(403).json({
        error: "Forbidden - You are not authorized to delete this message",
      });
    }

    // config cloudinary storage in prod and multer for dev env
    if (message.image) {
      if (useCloudinary) {
        try {
          // Extract public_id directly from the URL
          const regex = /\/modjo\/([^/]+)\.\w+$/;
          const match = message.image.match(regex);
          if (match && match[1]) {
            const public_id = `modjo/${match[1]}`;
            console.log(
              "Attempting to delete clan image message in delete controller with public_id:",
              public_id
            );
            const isVideo =
              message.image.includes("/video/upload/") ||
              ["mp4", "webm"]?.includes(match[2]?.toLowerCase());

            console.log(
              `Attempting to delete ${
                isVideo ? "video" : "image"
              } with public_id:`,
              public_id
            );
            const result = await cloudinary.uploader.destroy(public_id, {
              resource_type: isVideo ? "video" : "image",
            });
            console.log(
              "Cloudinary clan image message deletion result:",
              result
            );
          }
        } catch (err) {
          console.error(
            "Error deleting image in delete clan message controller:",
            err
          );
        }
      } else {
        const imagePath = path.join(dirname, message.image);
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          console.error("Error deleting image:", err);
        }
      }
    }

    // Handle image deletion if exists in dev env
    // if (message.image) {
    //   const imagePath = path.join(dirname, message.image);
    //   try {
    //     await fs.unlink(imagePath);
    //   } catch (err) {
    //     console.error("Error deleting image:", err);
    //   }
    // }

    const deletedMessage = await Message.findByIdAndDelete(MessageId);

    // Remove message from clan's messages array
    if (clan) {
      clan.messages = clan.messages.filter(
        (msgId) => msgId.toString() !== MessageId.toString()
      );
      await clan.save();
    }

    res.json(deletedMessage);
  } catch (error) {
    console.error("Error deleting clan message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getClanMessages = async (req, res) => {
  const userId = req.user._id;
  const { ClanId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find the clan and check permissions first
    const clan = await Clan.findById(ClanId).select(
      "name bannerImage messages moderators admins members"
    );

    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    // Check user permissions
    const isMember = clan.members.some((memberId) => memberId.equals(userId));
    const isModerator = clan.moderators.some((modId) => modId.equals(userId));
    const isAdmin = clan.admins.some((adminId) => adminId.equals(userId));

    if (!isMember && !isModerator && !isAdmin) {
      return res.status(403).json({
        error: "You are not authorized to view messages of this clan",
      });
    }

    // Get total count of messages
    const totalMessages = clan.messages.length;

    // Get paginated messages with population
    const messages = await Clan.findById(ClanId)
      .populate({
        path: "messages",
        populate: {
          path: "senderId",
          select: "username profilePic",
        },
        options: {
          sort: { createdAt: -1 },
          skip: skip,
          limit: parseInt(limit),
        },
      })
      .select("messages");

    const clanDetails = {
      name: clan.name,
      bannerImage: clan.bannerImage,
      messages: messages.messages.reverse(),
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalMessages / parseInt(limit)),
      hasMore: skip + messages.messages.length < totalMessages,
    };

    res.status(200).json(clanDetails);
  } catch (error) {
    console.error("Error fetching clan messages:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserClanChats = async (req, res) => {
  const userId = req.user._id;

  try {
    // Find clans where the user is a member, moderator, or admin
    const clans = await Clan.find({
      $or: [{ members: userId }, { moderators: userId }, { admins: userId }],
    })
      .populate({
        path: "messages",
        populate: {
          path: "senderId",
          select: "username profilePic",
        },
      })
      .populate({
        path: "admins moderators members",
        select: "username profilePic",
      })
      .select("name bannerImage messages moderators admins members");

    if (!clans) {
      return res.status(404).json({ error: "No clans found for the user" });
    }

    // Extract messages and user details for each clan
    const clanMessages = await Promise.all(
      clans.map(async (clan) => {
        // Count unseen messages for this clan
        const unseenMessagesCount = await Message.countDocuments({
          clan: clan._id,
          seen: false,
          senderId: { $ne: userId },
        });

        // Get the sender ID of unseen messages
        const unseenMessagesSenderIds = await Message.distinct("senderId", {
          clan: clan._id,
          seen: false,
          senderId: { $ne: userId },
        });

        // Get the sender ID of the last message
        const lastMessageSenderId =
          clan.messages.length > 0
            ? clan.messages[clan.messages.length - 1].senderId._id
            : null;

        return {
          clanId: clan._id,
          name: clan.name,
          bannerImage: clan.bannerImage,
          messages: clan.messages,
          unseenMessagesCount,
          unseenMessagesSenderIds,
          lastMessageSenderId,
          admins: clan.admins.map((admin) => ({
            id: admin._id,
            username: admin.username,
            profilePic: admin.profilePic,
          })),
          moderators: clan.moderators.map((moderator) => ({
            id: moderator._id,
            username: moderator.username,
            profilePic: moderator.profilePic,
          })),
          members: clan.members.map((member) => ({
            id: member._id,
            username: member.username,
            profilePic: member.profilePic,
          })),
          lastMessage:
            clan.messages.length > 0
              ? {
                  content: clan.messages[clan.messages.length - 1].content,
                  image: clan.messages[clan.messages.length - 1].image,
                  sender: {
                    username:
                      clan.messages[clan.messages.length - 1].senderId.username,
                    profilePic:
                      clan.messages[clan.messages.length - 1].senderId
                        .profilePic,
                  },
                  createdAt: clan.messages[clan.messages.length - 1].createdAt,
                }
              : {
                  content: "No messages yet",
                  createdAt: "",
                },
        };
      })
    );

    res.status(200).json(clanMessages);
  } catch (error) {
    console.error("Error fetching user clan messages:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const markClanMessagesSeen = async (req, res) => {
  const { clanId } = req.params;
  const userId = req.user._id;

  try {
    // Update unseen messages in the specific clan for messages not sent by the current user
    const result = await Message.updateMany(
      {
        clan: clanId,
        seen: false,
        senderId: { $ne: userId },
      },
      {
        $set: { seen: true },
      }
    );

    res.status(200).json({
      message: "Messages marked as seen",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking clan messages as seen:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
