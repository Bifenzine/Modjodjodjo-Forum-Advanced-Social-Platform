import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaEllipsisV } from "react-icons/fa";
import { motion } from "framer-motion";
import { getPostDetail } from "../../DataFetching/DataFetching";
import {
  BookmarkPost,
  PostComments,
  PostRecommendations,
  UpDownVotes,
  UpdatePostModal,
} from "../../Components";
import { useAuthContext } from "../../Context/AuthContext";
import useUpdatePost from "../../Hooks/PostHooks/useUpdatePost";
import useDeletePost from "../../Hooks/PostHooks/useDeletePost";
import useCreateComment from "../../Hooks/CommentsHooks/useCreateComment";
import ImagePicker from "../../Components/ImagePicker/ImagePicker";
import getProfilePicUrl from "../../Utils/GetProfilePicUrl";
import ShareBtn from "../../Components/ShareBtn/ShareBtn";
import displayMedia from "../../Utils/displayMediaBasedOnExtension";
import FormatDate from "../../Utils/FormatDate";
import { Loader } from "lucide-react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import UploadProgressToast from "../../Components/Toasts/UploadProgressToast";

const PostDetail = () => {
  const { id } = useParams();
  const { authUser } = useAuthContext();
  const [postDetail, setPostDetail] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [postData, setPostData] = useState({});
  const [image, setImage] = useState(null);
  const [content, setContent] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  const MAX_COMMENT_LENGTH = 1000;

  const { updatePost, loading, progress, setToastStatus, toastStatus } =
    useUpdatePost();
  const { deletePost, loadingDelete } = useDeletePost();
  const { createComment, loadingComment } = useCreateComment();

  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    getPostDetail(id)
      .then((data) => {
        setPostDetail(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  const updatePostDetail = (updates) => {
    setPostDetail((prevPostDetail) => {
      if (!prevPostDetail) return prevPostDetail;
      return {
        ...prevPostDetail,
        ...updates,
        user: { ...prevPostDetail.user, ...updates.user },
        comments: updates.comments || prevPostDetail.comments,
      };
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditClick = (post) => {
    setPostData(post);
    setIsEditModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleUpdatePost = async (updatedPostData) => {
    try {
      const updatedPost = await updatePost(postDetail._id, updatedPostData);
      console.log("Updated Post Data:", updatedPost);
      updatePostDetail(updatedPost);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(postDetail._id);
      setIsMenuOpen(false);
      // Handle post-deletion actions (e.g., redirect to homepage)
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen((prevStat) => !prevStat);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleBtnClick = () => {
    fileInputRef.current.click();
  };

  const cancelPost = () => {
    fileInputRef.current.value = "";
    setImage(null);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value.slice(0, MAX_COMMENT_LENGTH);
    setContent(newContent);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", content);
    if (image && image.size > 0) {
      formData.append("photo", image);
    }

    try {
      const createUserComment = await createComment(formData, id);
      console.log("Created comment:", createUserComment);
      setContent("");
      setImage(null);
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  if (!postDetail) {
    return (
      <div className="flex justify-center items-center h-screen text-text">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 text-text">
      {/* sticky go back button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-[calc(50%-20px)] left-2 sm:hidden
         z-50 p-2 sm:p-3 md:p-4 bg-primary-dark opacity-80 shadow-lg rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </button>

      <div className="bg-background-dark shadow-lg rounded-lg overflow-hidden">
        <div className="p-2 sm:p-4 md:p-6">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <div className="flex items-center">
              <img
                className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-cover rounded-full"
                src={getProfilePicUrl(postDetail?.user?.profilePic)}
                alt=""
              />
              <Link
                className="ml-2 sm:ml-3 md:ml-4 text-xs sm:text-sm md:text-base font-semibold text-white hover:text-primary"
                to={`/profile/${postDetail?.user?._id}`}>
                {postDetail?.user?.username}
              </Link>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <ShareBtn
                postID={postDetail?._id}
                shareCount={postDetail?.shareCount}
                postTitle={postDetail?.title}
              />
              <div className="p-1 sm:p-2 border cursor-pointer rounded-full">
                <BookmarkPost postId={postDetail?._id} />
              </div>
              <div className="relative" ref={menuRef}>
                {authUser?._id === postDetail?.user?._id && (
                  <>
                    <button
                      className="p-1 sm:p-2 rounded-full bg-surface-light text-text hover:bg-surface-dark transition lg:hidden"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}>
                      <FaEllipsisV size={14} />
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-surface rounded-md shadow-lg z-60 lg:hidden">
                        <button
                          className="block w-full text-left px-3 py-2 text-xs sm:text-sm text-text hover:bg-surface-light"
                          onClick={() => handleEditClick(postDetail)}>
                          <CiEdit className="inline mr-2" /> Edit
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-xs sm:text-sm text-text hover:bg-surface-light"
                          onClick={handleDeletePost}>
                          {loadingDelete ? (
                            <Loader className="animate-spin w-4 h-4 mx-0" />
                          ) : (
                            <RiDeleteBin6Fill className="inline mr-2" />
                          )}
                          {loadingDelete ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              {authUser?._id === postDetail?.user?._id && (
                <div className="hidden lg:flex lg:space-x-2">
                  <button
                    className="p-2 rounded-full bg-surface-light text-text hover:bg-surface-dark transition"
                    onClick={() => handleEditClick(postDetail)}>
                    <CiEdit size={20} />
                  </button>
                  <button
                    className="p-2 rounded-full bg-surface-light text-text hover:bg-surface-dark transition"
                    onClick={handleDeletePost}>
                    {loadingDelete ? (
                      <Loader className="w-5 h-5 mx-auto animate-spin" />
                    ) : (
                      <RiDeleteBin6Fill size={20} />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">
            {postDetail?.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: "easeInOut", duration: 0.5, delay: 0.2 }}
            className="mb-2 sm:mb-4">
            {postDetail?.photo &&
              displayMedia(postDetail?.photo, postDetail?.title)}
          </motion.div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-4 text-xs sm:text-sm text-text-muted">
            <span className="mb-1 sm:mb-0">
              Posted: {FormatDate(postDetail?.createdAt)}
            </span>
            <UpDownVotes postDetail={postDetail} />
          </div>

          <div className="mb-3 sm:mb-4 md:mb-6">
            <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-primary">
              Details:
            </h2>
            <div className="border border-primary-light rounded-lg p-2 sm:p-3">
              <p className="whitespace-pre-line break-words text-xs sm:text-sm">
                {postDetail?.content && postDetail?.content !== "undefined"
                  ? postDetail?.content
                  : "No content available"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-primary">
                {postDetail?.comments?.length} Comments:
              </h2>
              <div className="border border-primary rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                <form
                  className="mb-2 sm:mb-3"
                  onSubmit={handleSubmitComment}
                  encType="multipart/form-data">
                  <div className="relative">
                    <textarea
                      rows={3}
                      className="w-full p-2 mb-2 rounded-md bg-background border border-surface text-text text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent pr-12 sm:pr-16"
                      placeholder="Write a comment..."
                      value={content}
                      onChange={handleContentChange}
                      maxLength={MAX_COMMENT_LENGTH}
                    />
                    <span className="absolute right-2 bottom-4 text-slate-500 text-xs">
                      {content.length}/{MAX_COMMENT_LENGTH}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <ImagePicker
                      fileInputRef={fileInputRef}
                      handleBtnClick={handleBtnClick}
                      handleFileChange={handleFileChange}
                      cancelPost={cancelPost}
                    />
                    <button
                      className="bg-primary text-text px-3 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-primary-dark transition"
                      type="submit"
                      disabled={loadingComment}>
                      {loadingComment ? (
                        <Loader className="animate-spin w-4 h-4 mx-auto" />
                      ) : (
                        "Post"
                      )}
                    </button>
                  </div>
                </form>
                <PostComments />
              </div>
            </div>
            <div>
              <PostRecommendations />
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <UpdatePostModal
          postData={postData}
          onUpdate={handleUpdatePost}
          onCancel={handleCloseModal}
          loading={loading}
          progress={progress}
          setToastStatus={setToastStatus}
          toastStatus={toastStatus}
        />
      )}
      <UploadProgressToast
        title={`Updating post: ${postDetail?.title}`}
        isVisible={toastStatus !== "idle"}
        progress={progress}
        status={toastStatus}
        onDismiss={() => setToastStatus("idle")}
      />
    </div>
  );
};

export default PostDetail;
