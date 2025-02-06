import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAllCategories } from "../../../DataFetching/DataFetching";
import ClansCards from "../ClansCards/ClansCards";

export default function ClanCategories({ initialClans }) {
  const [categories, setCategories] = useState([]);
  const [clans, setClans] = useState(initialClans);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    getAllCategories()
      .then((data) => {
        setCategories(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setClans(initialClans);
  }, [initialClans]);

  const fetchClansByCategory = (categoryId) => {
    setLoading(true);
    setActiveCategory(categoryId);
    if (categoryId) {
      const filtered = initialClans.filter(
        (clan) => clan.clanCategory._id === categoryId
      );
      setClans(filtered);
    } else {
      setClans(initialClans);
    }
    setLoading(false);
  };

  return (
    <div className="gradient-color min-h-screen p-0">
      <h1 className="text-4xl font-bold text-white mb-5 text-center">
        Clan Categories
      </h1>
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <CategoryButton
          active={activeCategory === null}
          onClick={() => fetchClansByCategory(null)}>
          All
        </CategoryButton>
        {categories.map((category) => (
          <CategoryButton
            key={category._id}
            active={activeCategory === category._id}
            onClick={() => fetchClansByCategory(category._id)}>
            {category.name}
          </CategoryButton>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <ClansCards clans={clans} />
        </motion.div>
      )}
    </div>
  );
}

const CategoryButton = ({ children, active, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`px-3 py-1 rounded-full text-white font-semibold transition-all ${
      active
        ? "border border-primary text-purple-900"
        : "bg-purple-700 hover:bg-purple-600"
    }`}
    onClick={onClick}>
    {children}
  </motion.button>
);
