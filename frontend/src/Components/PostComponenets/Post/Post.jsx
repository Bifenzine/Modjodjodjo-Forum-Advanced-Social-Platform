import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowDownwardOutlined, ArrowUpwardOutlined, DeleteOutline, EditOutlined, InsertCommentSharp, ShareSharp } from '@mui/icons-material'
import { Avatar } from '@mui/material'



const Post = ({ authUser, userid, postID,
    username, userPic, postCreationDate, title,
    content, onEditClick, onDeleteClick }) => {

        const {id} = useParams();
        console.log(id);

        useEffect(() => {
            getUserInfo(id)
              .then((data) => {
                setUserInfo(data.data);
                console.log(data);
              })
              .catch((err) => {
                console.log(err);
              });
          }, [id]);

    const handleEditClick = () => {
        onEditClick({ postID, title, content, userPic }); // Pass post data to edit modal
    };

    const handleDeletePost = () => {
        onDeleteClick(postID); // Pass post ID to delete function
    };


    return (
        <>
            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ease: "easeInOut", duration: 1 }}
                className='grid justify-center items-center py-2 px-4'>
                <div className='flex justify-between bg-slate-800 items-center border-t border-r border-l px-4'>
                    <Link to={`/${}/profile/${userid}`}>
                        <div className='flex justify-start items-center py-2'>
                            <Avatar src={userPic ? userPic : ''} />
                            <span>{username}</span>
                        </div>
                    </Link>
                    <div className='flex justify-end items-center'>
                        <span className='mr-4'>{postCreationDate}12 min ago</span>
                        {authUser?._id === userid && (
                            <>
                                <span onClick={handleEditClick} className='px-2 py-2 border-2 rounded-full border-slate-900 hover:bg-black'><EditOutlined /></span>
                                <span onClick={handleDeletePost} className='px-2 py-2 border-2 rounded-full border-slate-900 hover:bg-black'><DeleteOutline /></span>
                            </>
                        )}
                    </div>
                </div>
                <div className='grid border break-all py-2 px-6'>
                    <Link to={'/PostDetail/+id'}>
                        <div className='flex justify-center my-2 items-start w-full'>
                            <img className='w-[15rem] h-[10rem] border object-contain' src='/guest pic/user.png' alt='ok' />
                            <div className='grid'>
                                <strong >{title}</strong>
                                <p className=' w-[20rem] '>
                                    {content}
                                </p>
                            </div>
                        </div>
                    </Link>
                    <div className='border flex justify-between items-center px-4 py-1'>
                        <div className=' flex w-full justify-start items-center '>
                            <span className=" border-slate-600 rounded-lg px-2 py-1">
                                {" "}
                                <ArrowUpwardOutlined /> : 11 | <ArrowDownwardOutlined /> : 1
                            </span>
                        </div>
                        <div className='flex w-full justify-center items-center border-l border-r border-slate-600'>
                            <InsertCommentSharp />
                            <span>10</span>
                        </div>
                        <div className='flex w-full justify-center items-center'>
                            <ShareSharp /><span>13</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    )
}

export default Post