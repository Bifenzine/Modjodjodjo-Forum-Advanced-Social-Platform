import React from "react";
import { Tab } from "@headlessui/react";
import UserGrid from "./userTab/UserGrid";
import PostsGrid from "./postTab/PostsGrid";
import ClanGrid from "./ClanTab/ClanGrid";
import { motion } from "framer-motion";
import { Users, FileText, Flag } from "lucide-react";

const SearchTabs = ({ filteredClans, filteredUsers, filteredPosts }) => {
  return (
    <Tab.Group>
      <Tab.List className="flex p-1 space-x-1 rounded-t-lg">
        {["Posts", "Users", "Clans"].map((category) => (
          <Tab
            key={category}
            className={({ selected }) =>
              `w-full py-2.5 text-sm font-medium leading-5 text-white rounded-lg
              focus:outline-none  border border-primary
              ${
                selected
                  ? "bg-gradient-to-r from-background-light to-secondary-dark shadow border border-primary"
                  : "text-gray-400 hover:bg-white/[0.12] hover:text-white"
              }`
            }>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center space-x-2">
              {category === "Posts" && <FileText size={16} />}
              {category === "Users" && <Users size={16} />}
              {category === "Clans" && <Flag size={16} />}
              <span>{category}</span>
            </motion.div>
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-2">
        <Tab.Panel className="bg-gray-800 rounded-b-lg p-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}>
            <PostsGrid posts={filteredPosts} />
          </motion.div>
        </Tab.Panel>
        <Tab.Panel className="bg-gray-800 rounded-b-lg p-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}>
            <UserGrid users={filteredUsers} />
          </motion.div>
        </Tab.Panel>
        <Tab.Panel className="bg-gray-800 rounded-b-lg p-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}>
            <ClanGrid clans={filteredClans} />
          </motion.div>
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
};

export default SearchTabs;
