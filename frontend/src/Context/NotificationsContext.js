import React, { createContext, useContext, useState, useEffect } from "react";
import { getNotifications } from "../DataFetching/DataFetching";
import { useAuthContext } from "./AuthContext";
import { useSocketContext } from "./SocketContext";
import toast from "react-hot-toast";
import axios from "axios";
import config from "../config/config";
import notifSound from "../assets/sounds/alert.mp3";
import CustomToast from "../Components/Toasts/CustomToast";

const NotificationsContext = createContext();

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { authUser } = useAuthContext();
  const { socket } = useSocketContext();

  const notificationSound = new Audio(notifSound); // Add your notification sound file

  const fetchNotifications = async () => {
    if (authUser) {
      try {
        const fetchedNotifications = await getNotifications();
        setNotifications(fetchedNotifications);
        setUnreadCount(
          fetchedNotifications.filter((notif) => !notif.read).length
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [authUser]);

  useEffect(() => {
    if (socket) {
      socket.on("newNotification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Use the custom toast
        toast.custom((t) => <CustomToast t={t} notification={notification} />, {
          duration: 5000,
          position: "top-center",
        });

        notificationSound
          .play()
          .catch((error) => console.error("Error playing sound:", error));
      });

      return () => {
        socket.off("newNotification");
      };
    }
  }, [socket]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${config.apiUrl}/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `${config.apiUrl}/notifications/mark-all-read`,
        {},
        { withCredentials: true }
      );
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const clearNotification = async (notificationId) => {
    try {
      await axios.delete(`${config.apiUrl}/notifications/${notificationId}`, {
        withCredentials: true,
      });
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif._id !== notificationId)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification cleared!");
    } catch (error) {
      console.error("Error clearing notification:", error);
      toast.error("An error occurred while clearing the notification.");
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete(`${config.apiUrl}/notifications/clear-all`, {
        withCredentials: true,
      });
      setNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications cleared!");
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      toast.error("An error occurred while clearing all notifications.");
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        fetchNotifications,
      }}>
      {children}
    </NotificationsContext.Provider>
  );
};
