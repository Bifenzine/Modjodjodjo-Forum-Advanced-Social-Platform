import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SearchTabs from "./SearchTabs";
import {
  getAllPosts,
  getAllUsers,
  getClans,
} from "../../DataFetching/DataFetching";
import { Search } from "lucide-react";

const SearchModal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClans, setFilteredClans] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const clansData = await getClans();
      const usersData = await getAllUsers();
      const postsData = await getAllPosts();

      setFilteredClans(clansData.data);
      setFilteredUsers(usersData.data);
      setFilteredPosts(postsData.data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filterData = (data, key) => {
      return data.filter((item) =>
        item[key].toLowerCase().includes(searchTerm.toLowerCase())
      );
    };

    const fetchData = async () => {
      const clansData = await getClans();
      const usersData = await getAllUsers();
      const postsData = await getAllPosts();

      setFilteredClans(filterData(clansData.data, "name"));
      setFilteredUsers(filterData(usersData.data, "username"));
      setFilteredPosts(filterData(postsData.data, "title"));
    };

    fetchData();
  }, [searchTerm]);

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-4xl mx-auto">
        <div className="relative mb-8">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
            animate={{
              scale: [1, 1.02, 1],
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              times: [0, 0.2, 0.5, 0.8, 1],
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <div className="relative flex items-center bg-black rounded-lg">
            <Search className="absolute left-4 text-gray-400" size={20} />
            <input
              className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-lg transition-all duration-300"
              type="text"
              placeholder="What's on your mind?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className=" rounded-lg shadow-xl overflow-hidden">
          <SearchTabs
            filteredClans={filteredClans}
            filteredUsers={filteredUsers}
            filteredPosts={filteredPosts}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SearchModal;
