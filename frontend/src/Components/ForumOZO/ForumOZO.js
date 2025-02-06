import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "../SearchBar/SearchBar";
import { FaComments, FaEllipsisV } from "react-icons/fa";
import ChatsDrawer from "../ChatsComponents/ChatsDrawer";
import { Button } from "@material-tailwind/react";
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import NotificationsDropdown from "../Notifications/NotificationsDropdown";
import { useAuthContext } from "../../Context/AuthContext";
import { useNotifications } from "../../Context/NotificationsContext";
import CountFormat from "../../Utils/CountFormat";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  getQuickUnreadCount,
  getUnreadConversationsCount,
} from "../../DataFetching/DataFetching";

const ForumOZO = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { authUser } = useAuthContext();
  const { unreadCount } = useNotifications();
  const [unreadConversationsCount, setUnreadConversationsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const toggleDrawer = (open) => (event) => {
    if (!authUser) {
      return toast.error("You need to be logged in to access the chat");
    }
    if (
      event?.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const toggleNotifications = () => {
    if (!authUser) {
      return toast.error(
        "You need to be logged in to access the notifications"
      );
    }
    setNotificationsOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeNotifications = () => {
    setNotificationsOpen(false);
  };

  // Fetch unread conversations count
  const fetchUnreadCount = async () => {
    try {
      setIsLoading(true);
      const data = await getUnreadConversationsCount();
      setUnreadConversationsCount(data?.unreadConversationsCount || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchUnreadCount();
      // Set up polling interval for real-time updates
      const interval = setInterval(fetchUnreadCount, 20000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [authUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <motion.div
        className="sticky z-50 top-0 w-full bg-surface-dark border-2 border-primary-dark rounded-2xl"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {/* Logo and Title */}
            <motion.div
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={() => navigate("/")}>
              <img
                src="https://res.cloudinary.com/dp9d2rdk2/image/upload/v1728913659/logo_light_version_fmddvl.png"
                loading="lazy"
                alt="modjodjodjo"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg"
              />
              <span className="font-bold text-xl md:text-2xl text-gray-100">
                Modjodjodjo Forum
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <SearchBar />
              <ActionButtons
                toggleDrawer={toggleDrawer}
                toggleNotifications={toggleNotifications}
                unreadCount={unreadCount}
                unreadConversationsCount={unreadConversationsCount}
                isLoading={isLoading}
              />
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center space-x-3">
              <ChatButton
                onClick={toggleDrawer(true)}
                unreadCount={unreadConversationsCount}
                isMobile={true}
                isLoading={isLoading}
              />
              <MenuButton
                onClick={toggleMobileMenu}
                unreadCount={unreadCount + unreadConversationsCount}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            ref={mobileMenuRef}
            toggleDrawer={toggleDrawer}
            toggleNotifications={toggleNotifications}
            unreadCount={unreadCount}
            unreadConversationsCount={unreadConversationsCount}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>

      {/* Chat Drawer */}
      <ChatsDrawer
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        onAfterClose={fetchUnreadCount} // Refresh count after drawer closes
      />

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {notificationsOpen && (
          <motion.div
            ref={dropdownRef}
            className="fixed top-10 right-8 z-[1000]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}>
            <NotificationsDropdown closeNotifications={closeNotifications} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ActionButtons = ({
  toggleDrawer,
  toggleNotifications,
  unreadCount,
  unreadConversationsCount,
  isLoading,
}) => (
  <div className="flex items-center space-x-4">
    <ChatButton
      onClick={toggleDrawer(true)}
      unreadCount={unreadConversationsCount}
      showText={true}
      isLoading={isLoading}
    />
    <NotificationButton
      onClick={toggleNotifications}
      unreadCount={unreadCount}
    />
  </div>
);

const ChatButton = ({
  onClick,
  unreadCount,
  showText = false,
  isMobile = false,
  isLoading,
}) => {
  const { authUser } = useAuthContext();

  return (
    <motion.div
      className="relative w-full" // Added w-full here
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}>
      <Button
        onClick={onClick}
        className={`text-gray-100 bg-surface hover:bg-surface-light rounded-full shadow-lg transition-colors duration-200 flex items-center w-full justify-center
          ${showText ? "px-4 py-2" : "p-3"}`}>
        {" "}
        {/* Added w-full and justify-center */}
        <FaComments className={showText ? "mr-2" : ""} />
        {showText && "Chats"}
      </Button>
      {authUser && unreadCount > 0 && !isLoading && (
        <NotificationBadge
          count={unreadCount}
          className={`absolute ${
            isMobile
              ? "-top-1 -right-1"
              : "-top-2 -right-2 transform translate-x-1/2 -translate-y-1/2"
          }`}
        />
      )}
    </motion.div>
  );
};

const NotificationButton = ({ onClick, unreadCount }) => {
  const { authUser } = useAuthContext();

  return (
    <motion.div
      className="relative w-full" // Added w-full
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}>
      <Button
        onClick={onClick}
        className="text-gray-100 bg-surface hover:bg-surface-light rounded-full p-2 shadow-lg transition-colors duration-200 w-full flex items-center justify-center">
        {" "}
        {/* Added w-full, flex, items-center, justify-center */}
        <NotificationsIcon />
      </Button>
      {authUser && unreadCount > 0 && (
        <NotificationBadge
          count={unreadCount}
          className="absolute -top-2 -right-2 transform translate-x-1/2 -translate-y-1/2"
        />
      )}
    </motion.div>
  );
};

const MenuButton = ({ onClick, unreadCount }) => {
  const { authUser } = useAuthContext();

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}>
      <Button
        onClick={onClick}
        className="text-gray-100 bg-surface hover:bg-surface-light rounded-full p-2 shadow-lg transition-colors duration-200">
        <FaEllipsisV className="w-5 h-5" />
      </Button>
      {authUser && unreadCount > 0 && (
        <NotificationBadge
          count={unreadCount}
          className="absolute -top-1 -right-1"
        />
      )}
    </motion.div>
  );
};

const MobileMenu = React.forwardRef(
  (
    {
      toggleDrawer,
      toggleNotifications,
      unreadCount,
      unreadConversationsCount,
      isLoading,
    },
    ref
  ) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed z-60 top-16 right-4 left-4 bg-surface-dark rounded-lg shadow-xl p-4 space-y-4">
      <SearchBar />
      <div className="flex flex-col space-y-2">
        <ChatButton
          onClick={toggleDrawer(true)}
          unreadCount={unreadConversationsCount}
          showText={true}
          isLoading={isLoading}
        />
        <NotificationButton
          onClick={toggleNotifications}
          unreadCount={unreadCount}
        />
      </div>
    </motion.div>
  )
);

const NotificationBadge = ({ count, className = "" }) => {
  return (
    <motion.span
      className={`${className} bg-red-500 text-gray-100 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}>
      {CountFormat(count)}
    </motion.span>
  );
};

export default ForumOZO;
