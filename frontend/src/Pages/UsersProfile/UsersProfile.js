import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UpdatePostModal, UpdateUser } from "../../Components";
import {
  getBookmarkedPosts,
  getClansthatTheUserBelongsTo,
  getUserProfileAndPosts,
} from "../../DataFetching/DataFetching";
import { useAuthContext } from "../../Context/AuthContext";
import { Container, Grid } from "@mui/material";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { DeleteOutline, EditSharp } from "@mui/icons-material";
import { motion } from "framer-motion";
import useDeleteUser from "../../Hooks/UserHooks/useDeleteUser";
import "./UsersProfile.css";
import PostCardNewUi from "../../Components/PostNewUi/PostCardNewUi/PostCardNewUi";
import FollowBtn from "../../Components/FollowBtn/FollowBtn";
import CreateConversation from "../../Components/CreateConversation/CreateConversation";
import getProfilePicUrl from "../../Utils/GetProfilePicUrl";
import ClanGrid from "../SearchModal/ClanTab/ClanGrid";
import OnlineStatus from "../../Utils/OnlineStatus";
import { useSocketContext } from "../../Context/SocketContext";
import config from "../../config/config";
import { Loader } from "lucide-react";

const UsersProfile = () => {
  const { authUser } = useAuthContext();
  const { id } = useParams();

  const { onlineUsers } = useSocketContext();

  const [userInfo, setUserInfo] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [clans, setClans] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updateUser, setUpdateUser] = useState(false);

  const { deleteUserProfile, loading } = useDeleteUser();

  const ColorsAn = ["#5f9ea0", "#000000"];

  useEffect(() => {
    getUserProfileAndPosts(id)
      .then((data) => {
        setUserInfo(data.data.user);
        setUserPosts(data.data.posts);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id, userInfo]);

  useEffect(() => {
    getClansthatTheUserBelongsTo(id)
      .then((data) => {
        setClans(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  useEffect(() => {
    if (authUser?._id === id) {
      getBookmarkedPosts()
        .then((data) => {
          setBookmarks(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [authUser?._id, id]);

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditClickForUser = () => {
    setUpdateUser((prevStat) => !prevStat);
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUserProfile();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.8 }}
        className="w-full bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-lg shadow-2xl overflow-hidden">
        <div className="relative h-40 bg-gradient-to-b from-transparent to-black/50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute -bottom-20 left-10">
            <div className="relative">
              <motion.img
                whileHover={{ scale: 1.05 }}
                className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg"
                src={getProfilePicUrl(
                  userInfo?.profilePic
                    ? userInfo?.profilePic
                    : // for testing purposes only keep this line below for prodction keep the whole condition
                      `${config.apiUrl}/${userInfo?.profilePic}`
                )}
                alt="profile pic"
              />
              {OnlineStatus(userInfo?._id, onlineUsers) && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-green-500 border-2 border-white"
                />
              )}
            </div>
          </motion.div>
        </div>

        <div className="p-6 pt-24 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-3xl font-bold text-white mb-2">
              {userInfo?.username}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-indigo-200 mb-4 max-w-md">
              {userInfo?.bio || "No bio available"}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex space-x-4 text-sm text-indigo-200">
              <span>Followers: {userInfo?.followers?.length}</span>
              <span>Following: {userInfo?.following?.length}</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 md:mt-0">
            {authUser?._id !== userInfo?._id && (
              <>
                <FollowBtn
                  userID={userInfo?._id}
                  userName={userInfo?.username}
                  followers={userInfo?.followers}
                  following={userInfo?.following}
                />
                <CreateConversation participantID={userInfo?._id} />
              </>
            )}
            {authUser?._id === userInfo?._id && (
              <div className="flex space-x-2">
                <button
                  onClick={handleEditClickForUser}
                  className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition duration-200">
                  <EditSharp className="mr-2" /> Edit Profile
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition duration-200"
                  disabled={loading}>
                  {loading ? (
                    <Loader className="animate-spin w-5 h-5 mr-2" />
                  ) : (
                    <DeleteOutline className="mr-2" />
                  )}
                  {loading ? "Deleting..." : "Delete Profile"}
                </button>
              </div>
            )}
          </motion.div>
        </div>
        {updateUser && (
          <UpdateUser
            changeLogStat={handleEditClickForUser}
            username={userInfo?.username}
            profilePic={
              userInfo?.profilePic
                ? userInfo?.profilePic
                : // for testing purposes only keep this line below for prodction keep the whole condition
                  `${config.apiUrl}/${userInfo?.profilePic}`
            }
            bio={userInfo?.bio}
            email={userInfo?.email}
            fullname={userInfo?.fullName}
            gender={userInfo?.gender}
          />
        )}
      </motion.div>

      <TabGroup className="mt-4">
        <TabList className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 px-2 sm:px-0">
          <Tab
            className={({ selected }) =>
              classNames(
                "rounded-full py-1 px-3 text-xs sm:text-sm font-semibold text-white focus:outline-none transition-colors duration-200 flex-grow sm:flex-grow-0 sm:w-auto",
                selected ? "bg-white/10" : "hover:bg-white/5"
              )
            }>
            Posts
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                "rounded-full py-1 px-3 text-xs sm:text-sm font-semibold text-white focus:outline-none transition-colors duration-200 flex-grow sm:flex-grow-0 sm:w-auto",
                selected ? "bg-white/10" : "hover:bg-white/5"
              )
            }>
            Clans
          </Tab>
          {authUser?._id === userInfo?._id && (
            <Tab
              className={({ selected }) =>
                classNames(
                  "rounded-full py-1 px-3 text-xs sm:text-sm font-semibold text-white focus:outline-none transition-colors duration-200 flex-grow sm:flex-grow-0 sm:w-auto",
                  selected ? "bg-white/10" : "hover:bg-white/5"
                )
              }>
              Bookmarks
            </Tab>
          )}
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPosts.length > 0 ? (
                userPosts.map((userpost) => (
                  <PostCardNewUi
                    key={userpost?._id}
                    PostId={userpost?._id}
                    username={userpost?.user?.username}
                    userId={userpost?.user?._id}
                    userProfilePic={userpost?.user?.profilePic}
                    title={userpost?.title}
                    content={userpost?.content}
                    postImage={userpost?.photo}
                    category={userpost?.category}
                    clan={userpost?.clan}
                    comments={userpost?.comments?.length}
                    upVotes={userpost?.upVotes}
                    downVotes={userpost?.downVotes}
                    time={userpost?.createdAt}
                    shareCount={userpost?.shareCount}
                  />
                ))
              ) : (
                <div className="col-span-full flex p-10 w-full justify-center items-center h-full">
                  <p>No posts created yet</p>
                </div>
              )}
            </div>
          </TabPanel>
          <TabPanel>
            <ClanGrid clans={clans} />
          </TabPanel>
          {authUser?._id === userInfo?._id && (
            <TabPanel>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.length > 0 ? (
                  bookmarks.map((bookmark) => (
                    <PostCardNewUi
                      key={bookmark?._id}
                      PostId={bookmark?._id}
                      username={bookmark?.user?.username}
                      userId={bookmark?.user?._id}
                      userProfilePic={bookmark?.user?.profilePic}
                      title={bookmark?.title}
                      content={bookmark?.content}
                      postImage={bookmark?.photo}
                      category={bookmark?.category}
                      clan={bookmark?.clan}
                      comments={bookmark?.comments?.length}
                      upVotes={bookmark?.upVotes}
                      downVotes={bookmark?.downVotes}
                      time={bookmark?.createdAt}
                      shareCount={bookmark?.shareCount}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex p-10 w-full justify-center items-center h-full">
                    <p>No bookmarked posts yet</p>
                  </div>
                )}
              </div>
            </TabPanel>
          )}
        </TabPanels>
      </TabGroup>

      {isEditModalOpen && (
        <UpdatePostModal postData={selectedPost} onCancel={handleCloseModal} />
      )}
    </Container>
  );
};

export default UsersProfile;

// previous ui
{
  /* relooking this ui */
}
{
  /* <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeInOut", duration: 1 }}
        className="w-full flex justify-center items-center py-4 px-6"
      >
        <div className="w-full grid items-center border-2 py-4 px-5 rounded-md border-slate-400">
          <div className="flex justify-between items-center w-full">
            <div className="flex justify-center items-center py-2 px-4 mb-4">
              <div className="relative">

              <motion.img
                animate={{
                  borderColor: ColorsAn,
                  transition: {
                    ease: "linear",
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                  },
                }}
                className="w-24 h-24 object-cover rounded-full border-2 shadow-md shadow-slate-500 border-white border-b-cyan-500"
                src={getProfilePicUrl(userInfo?.profilePic)}
                alt="profile pic"
              />
               {OnlineStatus(userInfo?._id, onlineUsers) && (
                <>
                                <div className="absolute top-2 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-slate-800"></div>
                                <div className="absolute animate-pulse top-2 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-slate-800"></div>
                </>
                            )}
              </div>

              <motion.strong
                animate={{
                  borderColor: ColorsAn,
                  transition: {
                    ease: "linear",
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                  },
                }}
                className="px-4 py-2 ml-2 border-b-2"
              >
                {userInfo?.username}
              </motion.strong>
              {authUser?._id !== userInfo?._id && (
                <FollowBtn
                  userID={userInfo?._id}
                  userName={userInfo?.username}
                  followers={userInfo?.followers}
                  following={userInfo?.following}
                />
              )}
              <div className="">
                <p className="text-xs">
                  followers: {userInfo?.followers?.length}
                </p>
                <p className="text-xs">
                  following: {userInfo?.following?.length}
                </p>
              </div>
              {authUser?._id !== userInfo?._id && (
                <div>
                  <CreateConversation participantID={userInfo?._id} />
                </div>
              )}
            </div>

            {authUser?._id === userInfo?._id && (
              <div className="flex justify-center items-center">
                <button
                  onClick={handleEditClickForUser}
                  className="px-4 hover:bg-slate-400 hover:text-slate-900"
                >
                  <EditSharp /> Edit
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 border-l hover:bg-slate-400 hover:text-slate-900 delay-75 transition-opacity"
                >
                  <DeleteOutline /> Delete Profile
                </button>
              </div>
            )}
          </div>

          <motion.hr
            style={{
              scaleX: 0,
              transformOrigin: "left",
            }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.3, ease: "easeInOut" }}
          />

          <div className="w-fit flex-1 justify-center items-start break-all p-2">
            Bio :
            <p className="mt-2 py-2 px-4 bg-slate-800 rounded-sm shadow-lg shadow-black">
              {userInfo?.bio || "No bio available"}
            </p>
          </div>
        </div>
        {updateUser && (
          <UpdateUser
            changeLogStat={handleEditClickForUser}
            username={userInfo?.username}
            profilePic={`${config.apiUrl}/${userInfo?.profilePic}`}
            bio={userInfo?.bio}
            email={userInfo?.email}
            fullname={userInfo?.fullName}
            gender={userInfo?.gender}
          />
        )}
      </motion.div> */
}
{
  /*  */
}
