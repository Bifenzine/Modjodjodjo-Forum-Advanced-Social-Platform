import React from "react";
import { motion } from "framer-motion";
import UserCard from "./UserCard";

const UserGrid = ({ users }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {users.map((user, index) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}>
            <UserCard
              userID={user._id}
              name={user.username}
              image={user.profilePic}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UserGrid;
