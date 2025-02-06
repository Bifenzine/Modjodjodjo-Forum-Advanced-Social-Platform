import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { ButtonGroup, Button } from "@material-tailwind/react";
import useDeleteComment from "../../../Hooks/CommentsHooks/useDeleteComment";
import LikeCommentAndReply from "../LikeCommentAndReply/LikeCommentAndReply";
import { getCommentsForPost } from "../../../DataFetching/DataFetching";
import { useAuthContext } from "../../../Context/AuthContext";
import CommentsReply from "../../replyComponents/CommentsReply/CommentsReply";
import UpdateCommentModal from "../UpdateCommentModal/UpdateCommentModal";
import getProfilePicUrl from "../../../Utils/GetProfilePicUrl";
import config from "../../../config/config";
import { Loader } from "lucide-react";

const PostComments = () => {
  const { id } = useParams();
  const [comments, setComments] = useState([]);
  const { authUser } = useAuthContext();
  const { deleteComment, loading } = useDeleteComment();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getCommentsForPost(id)
      .then((data) => {
        setComments(data.data);
        // console.log("Comments data:", data.data); // Log the fetched data directly
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id, comments]);

  // Check if comments array is not empty before logging
  if (comments.length > 0) {
    // console.log("Comments state:", comments);
  }

  const closeModal = () => {
    setIsOpen((pervStat) => !pervStat);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      // console.log("comment Deleted :")
    } catch (error) {
      // console.error("Error deleting comment:", error);
    }
  };

  return (
    <section className="space-y-4">
      {comments.length > 0 ? (
        comments.map((comment, index) => (
          <div
            className="grid justify-start gap-2 items-center w-full py-2 px-2"
            key={index}>
            <div className="flex w-full justify-between items-center">
              <div className="flex items-center">
                <img
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                  src={getProfilePicUrl(
                    comment?.user?.profilePic ||
                      `${config.apiUrl}/${comment?.user?.profilePic}`
                  )}
                  alt=""
                />
                <Link
                  className="text-white ml-2 sm:ml-4 text-xs sm:text-sm"
                  to={`/profile/${comment?.user?._id}`}>
                  {comment?.user?.username}
                </Link>
              </div>
              {authUser?._id === comment?.user?._id && (
                <ButtonGroup className="gap-1 sm:gap-2 flex">
                  <Button
                    className="p-1 sm:p-2"
                    onClick={() => closeModal(comment._id)}>
                    <CiEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    className="p-1 sm:p-2 rounded-full"
                    onClick={() => handleDeleteComment(comment._id)}>
                    {loading ? (
                      <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mx-auto" />
                    ) : (
                      <RiDeleteBin6Fill className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </Button>
                </ButtonGroup>
              )}
              {isOpen && (
                <UpdateCommentModal
                  commentId={comment?._id}
                  commentContent={comment?.content}
                  commentImage={comment?.photo}
                  closeModal={closeModal}
                />
              )}
            </div>
            <div
              className="grid w-full justify-start break-all items-center bg-background border border-background-light 
            bg-opacity-60 p-2 sm:p-4 rounded-lg sm:rounded-3xl mb-2">
              <div className="relative w-full sm:w-[18rem]">
                {comment?.content && (
                  <div className="w-full">
                    <span className="text-xs sm:text-sm">
                      {comment.content}
                    </span>
                  </div>
                )}
                {comment?.photo && (
                  <div className="mt-2">
                    <img
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                      src={getProfilePicUrl(comment?.photo)}
                      alt=""
                    />
                  </div>
                )}
                <LikeCommentAndReply comment={comment} />
              </div>
              {comment?.replies?.length > 0 && (
                <CommentsReply comment={comment} />
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-sm sm:text-base">No comments yet!</div>
      )}
    </section>
  );
};

export default PostComments;
