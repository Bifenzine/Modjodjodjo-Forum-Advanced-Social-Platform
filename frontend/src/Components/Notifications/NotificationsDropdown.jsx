import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "../../Context/NotificationsContext";
import getNotificationContent from "../../Utils/NotificationUtils/GetNotificationContent";
import formatTime from "../../Utils/NotificationUtils/FormatTimeNotification";
import getNotificationLink from "../../Utils/NotificationUtils/GetNotificationsLink";
import getProfilePicUrl from "../../Utils/GetProfilePicUrl";

const NotificationsDropdown = ({ closeNotifications }) => {
  const navigate = useNavigate();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  } = useNotifications();

  return (
    <div className="fixed inset-x-2 top-10 md:absolute md:inset-auto md:right-0 md:top-16 w-auto md:w-96 max-w-[calc(100vw-1rem)] bg-background-dark rounded-2xl shadow-lg z-50">
      <div className="p-3 md:p-4">
        <div className="flex flex-col items-center mb-2 space-y-2">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-lg md:text-xl font-bold text-white">
              Your Notifications
            </h2>
            <button
              onClick={closeNotifications}
              className="text-white p-1 bg-background-dark border-2 border-primary rounded-full hover:text-slate-300 transition-colors">
              <svg
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex justify-center w-full items-center space-x-2">
            <button
              onClick={markAllAsRead}
              className="flex-1 py-1 px-2 rounded-xl text-xs md:text-sm bg-blue-950 text-blue-400 hover:text-blue-300 transition-colors">
              Mark all as read
            </button>
            <button
              onClick={clearAllNotifications}
              className="flex-1 py-1 px-2 rounded-xl text-xs md:text-sm bg-red-950 text-red-400 hover:text-red-300 transition-colors">
              Clear all
            </button>
          </div>
        </div>
        <div className="max-h-60 md:max-h-[calc(100vh-16rem)] overflow-y-auto overflow-x-hidden">
          {notifications?.length === 0 && (
            <p className="text-slate-400 text-center text-sm md:text-base">
              No notifications yet
            </p>
          )}
          {notifications?.map((notification) => (
            <div
              key={notification._id}
              className={`flex ${
                !notification.read ? "bg-background" : "bg-background-dark"
              } rounded-xl mb-2 shadow-sm`}>
              <Link
                to={getNotificationLink(notification)}
                className="flex-grow min-w-0"
                onClick={(e) => {
                  e.preventDefault();
                  markAsRead(notification._id);
                  closeNotifications();
                  navigate(getNotificationLink(notification));
                }}>
                <div className="flex items-center py-2 px-3 md:px-4">
                  <div className="mr-2 w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
                    <img
                      src={
                        getProfilePicUrl(notification?.sender?.profilePic) ||
                        "https://via.placeholder.com/24"
                      }
                      alt={notification?.sender?.username}
                      className="h-full w-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-slate-200 text-sm md:text-base truncate">
                      {getNotificationContent(notification)}
                    </h3>
                    <p className="text-slate-400 text-xs md:text-sm">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
              <button
                className="p-2 bg-background border-l border-primary-dark rounded-r-xl flex items-center flex-shrink-0"
                onClick={() => clearNotification(notification._id)}>
                <svg
                  className="h-4 w-4 md:h-5 md:w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsDropdown;
