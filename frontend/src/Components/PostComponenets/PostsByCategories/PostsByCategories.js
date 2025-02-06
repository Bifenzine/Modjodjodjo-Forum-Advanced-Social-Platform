import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightOutlined, Add, Close } from "@mui/icons-material";
import PostCards from "../PostCards/PostCards";
import PopularLatestSelect from "../../PopularLatestSelect/PopularLatestSelect";
import CreatePost from "../CreatePost/CreatePost";

const PostsByCategories = () => {
  const { id } = useParams();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const toggleCreatePost = () => {
    setIsCreatePostOpen(!isCreatePostOpen);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-start items-start gap-4 md:p-4 p-0 rounded-md relative">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
          className="w-full border-2 rounded bg-background border-primary px-3 md:px-6 py-4">
          <div className="flex justify-between items-center mb-4 pl-4">
            <PopularLatestSelect />
            <Link
              className="px-2 border-b border-slate-700 rounded-lg"
              to={`/Category/${id}`}>
              <span>
                See More
                <ArrowRightOutlined />
              </span>
            </Link>
          </div>
          <PostCards id={id} />
        </motion.div>

        {/* CreatePost component for larger screens */}
        <div className="hidden lg:block w-[30%] grid border-2 rounded bg-background-dark border-primary">
          <CreatePost />
        </div>

        {/* Floating button for medium screens */}
        <div className="lg:hidden fixed md:bottom-20 md:right-4 bottom-36 right-4 z-10">
          <button
            onClick={toggleCreatePost}
            className="bg-primary text-white rounded-full p-4 shadow-lg">
            {isCreatePostOpen ? <Close /> : <Add />}
          </button>
        </div>

        <AnimatePresence>
          {isCreatePostOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="fixed md:ml-16 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 ">
              <div
                className="bg-background-dark border-2 border-primary 
              rounded-lg md:p-4 md:w-[70%] w-[90%] max-w-md max-h-[70vh] overflow-y-auto relative md:mt-20 mt-0">
                <button
                  onClick={toggleCreatePost}
                  className="absolute -top-1 right-0 px-4 bg-surface-light  text-white hover:text-gray-300">
                  <Close />
                </button>
                <div className="pt-6">
                  <CreatePost />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default PostsByCategories;
