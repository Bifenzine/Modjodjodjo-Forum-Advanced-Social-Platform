import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, User } from "lucide-react";
import getProfilePicUrl from "../../../Utils/GetProfilePicUrl";
import truncateMsg from "../../../Utils/TruncateMsg";
import config from "../../../config/config";

const PostSuggestionItem = ({ post, index, scrollToTop }) => {
  const handleClick = () => {
    scrollToTop();
    // Any other click handling logic can go here
  };

  return (
    <Link
      to={`/${post.category?.name}/PostDetail/${post._id}`}
      onClick={handleClick}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="bg-background-dark rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:bg-background">
        <div className="flex items-center p-2 sm:p-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 mr-2 sm:mr-3">
            {post.photo?.toLowerCase().endsWith(".mp4") ? (
              <video
                className="w-full h-full object-cover rounded-lg"
                src={post.photo}
                alt=""
                autoPlay
                loop
                muted
              />
            ) : (
              <img
                className="w-full h-full object-cover rounded-lg"
                src={
                  post?.photo
                    ? getProfilePicUrl(post.photo)
                    : "https://raw.githubusercontent.com/juergenweb/JkImagePlaceholder/master/images/placeholderimage.jpg?raw=true"
                }
                alt=""
              />
            )}
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="font-bold text-sm sm:text-base md:text-lg text-white mb-1 truncate">
              {post.title}
            </h3>
            <div className="flex items-center text-xs sm:text-sm text-purple-300">
              <User size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">{post.user?.username}</span>
            </div>
          </div>
          <div className="flex flex-col items-end ml-2 flex-shrink-0">
            <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold mb-1 sm:mb-2 whitespace-nowrap">
              {post.category?.name}
            </span>
            <div className="flex items-center text-purple-300 text-xs sm:text-sm">
              <TrendingUp size={12} className="mr-1 flex-shrink-0" />
              <span className="font-semibold">{post.engagementScore}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default PostSuggestionItem;
