import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
  DeleteOutline,
  EditOutlined,
  InsertCommentSharp,
  ShareSharp,
} from "@mui/icons-material";
import { Avatar } from "@mui/material";
import { getUserProfileAndPosts } from "../../../DataFetching/DataFetching";
import config from "../../../config/config";

const Post = ({
  // authUser,
  userid,
  userInfo,
  category,
}) => {
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    getUserProfileAndPosts(userid)
      .then((data) => {
        setUserPosts(data.data);
        console.log(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [userid, userPosts]);

  return (
    <>
      {userPosts.map((post) => (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: "easeInOut", duration: 1 }}
          className="grid justify-center items-center py-2 px-4">
          <div className="flex  justify-between bg-slate-900 items-center border border-slate-500  px-4">
            {/* <Link to={`profile/${userid}`}> */}
            <div className="flex gap-4 justify-start items-center py-2">
              <Avatar src={`${config.apiUrl}/${post?.user?.profilePic}`} />
              <div className="grid justify-start items-center">
                <span className="font-semibold">{post?.user?.username}</span>
                <Link to={`/${post?.category?.name}/${post?.category?._id}`}>
                  <span className="text-xs font-bold text-slate-400 ">
                    category : {post?.category?.name}
                  </span>
                </Link>
              </div>
            </div>
            <div>
              <span className="px-2 py-1 border-2 rounded-full border-slate-700 bg-black">
                {post?.timeSinceCreation}
              </span>
            </div>
            {/* </Link> */}

            {/* <div className='flex justify-end items-center'>
                       <span className='mr-4'>{postCreationDate}12 min ago</span>
                       {authUser?._id === userid && (
                           <>
                               <span onClick={handleEditClick} className='px-2 py-2 border-2 rounded-full border-slate-900 hover:bg-black'><EditOutlined /></span>
                               <span onClick={handleDeletePost} className='px-2 py-2 border-2 rounded-full border-slate-900 hover:bg-black'><DeleteOutline /></span>
                           </>
                       )}
                   </div> */}
          </div>
          <div className="grid border border-slate-500 break-all py-2 px-6">
            <Link to={`/${post?.category?.name}/postDetail/${post?._id}`}>
              <div className="flex justify-center my-2 items-start w-full">
                <img
                  className="w-[15rem] h-[10rem] border border-slate-500 rounded-xl object-contain"
                  src={`${config.apiUrl}/${post?.photo}`}
                  alt="ok"
                />
                <div className="grid px-4 ">
                  <strong className="text-2xl">
                    {post?.title?.substring(0, 30)} ... :
                  </strong>
                  <p className=" w-[20rem]  ">
                    {post?.content?.substring(0, 200)} ...
                  </p>
                </div>
              </div>
            </Link>
            <div className="border border-slate-500 rounded-md flex justify-between items-center px-4 py-1">
              <div className=" flex w-full justify-start items-center ">
                <span className=" border-slate-600 rounded-lg px-2 py-1">
                  {" "}
                  <ArrowUpwardOutlined /> : 11 | <ArrowDownwardOutlined /> : 1
                </span>
              </div>
              <div className="flex w-full justify-center items-center border-l border-r border-slate-600">
                <InsertCommentSharp />
                <span>10</span>
              </div>
              <div className="flex w-full justify-center items-center">
                <ShareSharp />
                <span>13</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default Post;
