import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClansLeaderBoard, ClansSearchAndTabs } from "../../Components";
import { FaTrophy, FaTimes } from "react-icons/fa";

const Clans = () => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const toggleLeaderboard = () => {
    setIsLeaderboardOpen(!isLeaderboardOpen);
  };

  return (
    <main className="min-h-screen text-white">
      <div className="container mx-auto ">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
          Clans Arena
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: "easeOut", duration: 0.7 }}
            className="w-full lg:w-2/3">
            <ClansSearchAndTabs />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ease: "easeOut", duration: 0.7 }}
            className="hidden lg:block w-1/3">
            <div className="bg-background-dark rounded-lg shadow-xl overflow-hidden">
              <div className="bg-purple-600 text-white py-4 px-6">
                <h2 className="text-2xl font-bold">Leaderboard</h2>
              </div>
              <div className="p-4">
                <ClansLeaderBoard />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <button
        onClick={toggleLeaderboard}
        className="lg:hidden fixed bottom-36 right-4 md:bottom-20 md:right-4
         bg-background-dark text-white p-4 rounded-full shadow-lg z-10
          hover:bg-primary-dark transition-colors duration-300 border-2 border-primary-dark">
        <FaTrophy size={24} />
      </button>

      <AnimatePresence>
        {isLeaderboardOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden fixed bottom-16 inset-0 bg-background-dark z-50 overflow-y-auto">
            <div className="bg-purple-600 text-white py-4 px-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Leaderboard</h2>
              <button
                onClick={toggleLeaderboard}
                className="text-white hover:text-gray-200 transition-colors duration-300">
                <FaTimes size={24} />
              </button>
            </div>
            <div className="p-4">
              <ClansLeaderBoard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Clans;
