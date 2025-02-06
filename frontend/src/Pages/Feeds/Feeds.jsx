import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import FeedPosts from "../../Components/FeedComponents/FeedPosts";
import SuggestedPersons from "../../Components/FeedComponents/SuggestedPersons";
import UserOnlineFriends from "../../Components/UserOnlineFriends/UserOnlineFriends";
import ClansThatTheUserIsIn from "../../Components/FeedComponents/ClansGrid/ClansThatTheUserIsIn";
import { useAuthContext } from "../../Context/AuthContext";

const Feeds = () => {
  const { authUser } = useAuthContext();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-transparent">
      {/* Main content layout */}
      <div className="flex flex-col lg:flex-row justify-center items-start gap-5 py-0 px-0 lg:px-16 rounded-md">
        {/* Feed Posts Section */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
          className="w-full lg:w-2/3 rounded-2xl bg-transparent px-4 lg:px-12 py-4">
          {authUser && !authUser.isVerified && (
            <div className="flex-col w-full justify-center items-center p-4 bg-slate-800 rounded-2xl mb-2">
              <p className="text-orange-500 text-center">
                Please Verify Your Email first to create Your Feed
              </p>
              <button className="text-orange-500">Verify Email</button>
            </div>
          )}
          {/* <FeedPosts /> */}
        </motion.div>

        {/* Sidebar for large screens */}
        <div className="hidden lg:block w-1/3 h-fit rounded-2xl bg-background-dark">
          {/* <SuggestedPersons />
          <UserOnlineFriends />
          <ClansThatTheUserIsIn /> */}
        </div>
      </div>

      {/* Drawer toggle button for medium and small screens */}
      <button
        onClick={toggleDrawer}
        className="lg:hidden fixed border border-primary md:bottom-20 md:right-4 bottom-36 right-4 z-30 bg-background-dark text-white p-3 rounded-full shadow-lg">
        {isDrawerOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Drawer for medium and small screens */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 top-32 bottom-20 w-[20rem] border-l-2 border-l-primary-dark rounded-tl-3xl bg-background-dark shadow-lg z-20 overflow-y-auto lg:hidden">
            <button
              onClick={toggleDrawer}
              className="absolute top-2 right-2 text-white p-2 bg-primary-dark rounded-full">
              <X size={24} />
            </button>
            <div className="md:p-2 px-1 mt-12">
              <SuggestedPersons />
              <UserOnlineFriends />
              <ClansThatTheUserIsIn />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Feeds;
