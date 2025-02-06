import React, { useContext } from "react";
import { pageActiveContext } from "../Components/ContextPageActive/ContextPageActive";
import { motion } from "framer-motion";
import HeroSection from "../Components/HomeComponents/HeaderSection/HeroSection";

const Home = () => {
  useContext(pageActiveContext);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ease: "easeOut",
        duration: 0.6,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen w-full px-2 sm:px-4 lg:px-4 py-2 ">
      <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <motion.div
            variants={itemVariants}
            className="w-full lg:w-full rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800/50 shadow-xl">
            <div className="p-2 sm:p-4">{/* <HeroSection /> */}</div>
          </motion.div>

          {/* Commented section converted to motion div for future use */}
          {/* <motion.div 
            variants={itemVariants}
            className="w-full lg:w-[40%] rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800/50 shadow-xl"
          >
            <div className="p-6">
              okok
            </div>
          </motion.div> */}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
