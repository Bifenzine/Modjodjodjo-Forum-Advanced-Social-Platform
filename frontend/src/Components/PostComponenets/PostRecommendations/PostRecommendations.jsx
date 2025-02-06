import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getSuggestedPosts } from "../../../DataFetching/DataFetching";
import PostSuggestionItem from "./PostSuggestionItem";

const PostRecommendations = () => {
  const { id } = useParams();
  const [postRecommendations, setPostRecommendations] = useState([]);

  useEffect(() => {
    getSuggestedPosts(id)
      .then((data) => {
        setPostRecommendations(data);
      })
      .catch((err) => {
        console.error("Error fetching post recommendations:", err);
      });
  }, [id]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (postRecommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white p-4 flex justify-center items-center text-lg bg-indigo-900 rounded-xl shadow-lg">
        No recommendations found
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl shadow-xl overflow-hidden">
      <h2 className="font-bold text-2xl mb-4 text-primary ">Discover More</h2>
      <div className="space-y-4 bg-background">
        {postRecommendations?.map((post, index) => (
          <PostSuggestionItem
            key={post._id}
            post={post}
            index={index}
            scrollToTop={scrollToTop}
          />
        ))}
      </div>
    </motion.section>
  );
};

export default PostRecommendations;
