import { GrLike } from "react-icons/gr";
import CommentSharpIcon from "@mui/icons-material/CommentSharp";
import useLikeComment from "../../../Hooks/CommentsHooks/useLikeComment";
import { useState } from "react";
import CreateReplyModal from "../../CreateReplyModal/CreateReplyModal";
import { useAuthContext } from "../../../Context/AuthContext";
import { Loader } from "lucide-react";

const LikeCommentAndReply = ({ comment }) => {
  const { authUser } = useAuthContext();

  // received comment from parent component
  console.log(comment);

  const loggedInUserId = authUser?._id;
  const likedComment = comment?.likes
    ? comment.likes.includes(loggedInUserId)
    : false;
  const [liked, setLiked] = useState(likedComment);
  const [isOpen, setIsOpen] = useState(false);
  const { likeComment, loading } = useLikeComment();

  console.log(liked);

  const handleLikeComment = async () => {
    try {
      await likeComment(comment._id);
    } catch (error) {
      // Handle the error
    }
  };

  const OpenModal = () => {
    setIsOpen((prevStat) => !prevStat);
  };

  return (
    <div className="flex rounded-xl mt-4 justify-end items-center">
      <span className="flex bg-slate-950 px-8 py-2 rounded-3xl items-center gap-10 bottom-1 right-2">
        <span
          className="flex justify-center items-center gap-2 cursor-pointer"
          onClick={OpenModal}>
          {/* <CommentSharpIcon onClick={OpenModal} /> {comment?.replies?.length} */}
          Reply
        </span>
        {isOpen ? (
          <CreateReplyModal commentId={comment._id} closeModal={OpenModal} />
        ) : null}
        {/* like icon */}
        <span className="flex justify-center items-center gap-2">
          {loading ? (
            <GrLike className="animate-ping" onClick={handleLikeComment} />
          ) : (
            <GrLike
              className={likedComment ? "text-blue-600" : "text-white"}
              onClick={handleLikeComment}
            />
          )}

          {comment?.likes?.length}
        </span>
      </span>
    </div>
  );
};

export default LikeCommentAndReply;
