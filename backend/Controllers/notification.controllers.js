import Notification from "../models/notification.model.js";

// Get all notifications for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate("sender", "username profilePic")
      .populate({
        path: "post",
        select: "title category",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .populate("comment", "content")
      .populate("clan", "name")
      .limit(20); // Limit to most recent 20 notifications

    res.json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: error.message });
  }
};

// Mark a specific notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error marking notification as read",
        error: error.message,
      });
  }
};

// Delete a specific notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting notification", error: error.message });
  }
};

// Clear all notifications for the logged-in user
export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ message: "All notifications cleared successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing notifications", error: error.message });
  }
};

// Mark all notifications as read for the logged-in user
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error marking all notifications as read",
        error: error.message,
      });
  }
};

// You may want to add a function to create notifications, to reduce duplication:
// const createAndSendNotification = async (recipientId, senderId, type, content, extraData = {}) => {
//     const notification = await Notification.create({
//       recipient: recipientId,
//       sender: senderId,
//       type,
//       content,
//       ...extraData
//     });

//     sendNotification(recipientId, notification);
//     return notification;
//   };
