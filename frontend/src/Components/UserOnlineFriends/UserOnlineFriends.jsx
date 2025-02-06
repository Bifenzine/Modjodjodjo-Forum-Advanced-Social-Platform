import React from "react";
import { motion } from "framer-motion";
import { useSocketContext } from "../../Context/SocketContext";
import OnlineUserGrid from "../FeedComponents/OnlineUserGrid";

const UserOnlineFriends = () => {
  const { onlineFriends } = useSocketContext();

  return (
    <div className="bg-slate-900 p-3 shadow-md rounded-2xl">
      <h2 className="text-xl font-bold mb-1">Online modjoos</h2>

      <motion.hr
        style={{
          scaleX: 0,
          transformOrigin: "left",
        }}
        animate={{ scaleX: 1.2 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="w-[8rem] mb-4"></motion.hr>

      <OnlineUserGrid OnlineUsers={onlineFriends} />
    </div>
  );
};

export default UserOnlineFriends;
