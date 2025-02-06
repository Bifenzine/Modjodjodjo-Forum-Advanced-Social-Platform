import React from "react";
import { motion } from "framer-motion";
import PostP from "./PostP";

const PostsGrid = ({ posts }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {posts.map((post, index) => (
          <motion.div
            key={post?._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}>
            <PostP
              PostId={post?._id}
              img={post?.photo}
              title={post?.title}
              name={post?.user.username}
              pic={post?.user.profilePic}
              upVotes={post?.upVotes}
              downVotes={post?.downVotes}
              category={post?.category?.name}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PostsGrid;
