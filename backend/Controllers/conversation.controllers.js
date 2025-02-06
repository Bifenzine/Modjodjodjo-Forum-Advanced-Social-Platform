import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import mongoose from "mongoose";
import { sendNotification } from "../socket/socket.js";
import Message from "../models/message.model.js";

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find conversations with selective population to reduce data transfer
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({
        path: "participants",
        select: "username profilePic", // Only select needed fields
      })
      .populate({
        path: "messages",
        populate: {
          path: "senderId",
          select: "_id username", // Select both username and _id for sender
        },
        select: "senderId content image seen createdAt", // Only select needed message fields
      })
      .lean(); // Use lean() for better performance as we don't need Mongoose documents

    // Transform conversations efficiently
    const formattedConversations = conversations.map((conv) => {
      const lastMessage = conv.messages[conv.messages.length - 1] || null;

      // Find receiver more efficiently
      const receiver = conv.participants.find(
        (participant) => participant._id.toString() !== userId.toString()
      ) || { _id: "Unknown", username: "Unknown", profilePic: "default.png" };

      // Filter unseen messages more efficiently
      const unseenMessages = conv.messages.filter(
        (message) =>
          !message.seen && message.senderId._id.toString() !== userId.toString()
      );

      // Map unseen messages with minimal processing
      const unseenMessagesDetails = unseenMessages.map((message) => ({
        id: message._id,
        senderId: message.senderId._id.toString(),
        content: message.content,
        senderName: message.senderId.username,
        createdAt: message.createdAt,
        image: message.image || null,
      }));

      // Build conversation object with all required fields
      return {
        id: conv._id,
        receiverId: receiver._id,
        receiverName: receiver.username,
        receiverPic: receiver.profilePic,
        senderId: lastMessage?.senderId?._id.toString(), // Extract senderId as a string
        lastMessage: lastMessage
          ? {
              content: lastMessage.content || null,
              image: lastMessage.image || null,
            }
          : { content: "No messages yet", image: null },
        date: lastMessage?.createdAt,
        unseenCount: unseenMessages.length,
        unseenMessages: unseenMessagesDetails,
        // Only include essential participant info
        participants: conv.participants.map((participant) => ({
          id: participant._id,
          username: participant.username,
          profilePic: participant.profilePic,
        })),
      };
    });

    // Sort conversations efficiently using timestamp comparison
    formattedConversations.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    res.status(200).json(formattedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createConversation = async (req, res) => {
  try {
    const { participantId } = req.params; // ID of the user to start a conversation with
    const userId = req.user._id; // ID of the current user

    // Validate participant ID
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ error: "Invalid participant ID" });
    }

    // Check if both users exist
    const [currentUser, participant] = await Promise.all([
      User.findById(userId),
      User.findById(participantId),
    ]);

    if (!currentUser || !participant) {
      return res.status(404).json({ error: "One or both users not found" });
    }

    // Check if a conversation already exists between the two users
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
    });

    if (existingConversation) {
      return res.status(200).json({
        message: "Conversation already exists",
        conversationId: existingConversation._id,
      });
    }

    // Create a new conversation
    const newConversation = new Conversation({
      participants: [userId, participantId],
      messages: [],
    });
    await newConversation.save();

    // Create a notification for the participant
    const notification = await Notification.create({
      recipient: participantId,
      sender: userId,
      type: "direct_message",
      content: `${currentUser.username} started a conversation with you`,
    });

    sendNotification(participantId, notification);

    res.status(201).json({
      message: "Conversation created successfully",
      conversationId: newConversation._id,
    });
  } catch (error) {
    console.error("Error in createConversation controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUnreadConversationsCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all conversations where the user is a participant
    const conversations = await Conversation.aggregate([
      // Match conversations where user is a participant
      {
        $match: {
          participants: userId,
        },
      },
      // Lookup and unwind messages
      {
        $lookup: {
          from: "messages",
          localField: "messages",
          foreignField: "_id",
          as: "messages",
        },
      },
      // Count unread messages where the user is not the sender
      {
        $project: {
          _id: 1,
          unreadCount: {
            $size: {
              $filter: {
                input: "$messages",
                as: "message",
                cond: {
                  $and: [
                    { $eq: ["$$message.seen", false] },
                    { $ne: ["$$message.senderId", userId] },
                  ],
                },
              },
            },
          },
        },
      },
      // Only include conversations with unread messages
      {
        $match: {
          unreadCount: { $gt: 0 },
        },
      },
    ]);

    const unreadConversationsCount = conversations.length;
    const unreadConversationsDetails = conversations.map((conv) => ({
      conversationId: conv._id,
      unreadCount: conv.unreadCount,
    }));

    // Update the unreadMessagesCount field for each conversation
    await Promise.all(
      conversations.map((conv) =>
        Conversation.findByIdAndUpdate(conv._id, {
          unreadMessagesCount: conv.unreadCount,
        })
      )
    );

    res.status(200).json({
      unreadConversationsCount,
      unreadConversationsDetails,
    });
  } catch (error) {
    console.error("Error counting unread conversations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getQuickUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // First, ensure unreadMessagesCount is synchronized
    const conversations = await Conversation.find({
      participants: userId,
    }).select("_id messages");

    // Update unreadMessagesCount for all conversations
    await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          _id: { $in: conv.messages },
          senderId: { $ne: userId },
          seen: false,
        });

        if (unreadCount !== conv.unreadMessagesCount) {
          await Conversation.findByIdAndUpdate(conv._id, {
            unreadMessagesCount: unreadCount,
          });
        }
      })
    );

    // Now get the accurate count
    const unreadConversationsCount = await Conversation.countDocuments({
      participants: userId,
      unreadMessagesCount: { $gt: 0 },
    });

    res.status(200).json({ unreadConversationsCount });
  } catch (error) {
    console.error("Error getting quick unread count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Updated markConversationAsSeen function
export const markConversationAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId).populate({
      path: "messages",
      populate: {
        path: "senderId",
        select: "_id username",
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Get messages that need to be updated
    const unseenMessages = conversation.messages.filter(
      (message) =>
        message &&
        !message.seen &&
        message.senderId &&
        message.senderId._id.toString() !== userId.toString()
    );

    // Update messages
    await Promise.all(
      unseenMessages.map((message) =>
        Message.findByIdAndUpdate(message._id, { seen: true })
      )
    );

    // Reset unseenMessages count in conversation
    conversation.unseenMessages = 0;
    await conversation.save();

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    console.error("Error marking conversation as seen:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
