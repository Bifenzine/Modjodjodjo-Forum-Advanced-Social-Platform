import React, { useState, useEffect } from "react";
import {
  IoArrowDownOutline,
  IoArrowUpOutline,
  IoChatbubbleOutline,
} from "react-icons/io5";
import { useAuthContext } from "../../../Context/AuthContext";
import useUpvotePost from "../../../Hooks/UpDownVotesHooks/useUpVotes";
import useDownvotePost from "../../../Hooks/UpDownVotesHooks/useDownVotes";
import { Button } from "@material-tailwind/react";
import ShareBtn from "../../ShareBtn/ShareBtn";
import { Link } from "react-router-dom";
import { useSocketContext } from "../../../Context/SocketContext";

const ReactionSection = ({
  upVotes,
  downVotes,
  comments,
  PostId,
  shareCount,
  category,
  userId,
}) => {
  const { authUser } = useAuthContext();
  const { postUpdate, socket } = useSocketContext();
  const loggedInUserId = authUser?._id;

  const [upVotesCount, setUpVotesCount] = useState(upVotes?.length || 0);
  const [downVotesCount, setDownVotesCount] = useState(downVotes?.length || 0);
  const [shareCountState, setShareCountState] = useState(shareCount || 0);

  const initialUpVoted = upVotes ? upVotes.includes(loggedInUserId) : false;
  const initialDownVoted = downVotes
    ? downVotes.includes(loggedInUserId)
    : false;

  const [upVoted, setUpVoted] = useState(initialUpVoted);
  const [downVoted, setDownVoted] = useState(initialDownVoted);

  const { upvotePost } = useUpvotePost();
  const { downvotePost } = useDownvotePost();

  useEffect(() => {
    if (postUpdate && postUpdate.postId === PostId) {
      if (postUpdate.type === "upvote" || postUpdate.type === "downvote") {
        setUpVotesCount(postUpdate.upVotes.length);
        setDownVotesCount(postUpdate.downVotes.length);
        setUpVoted(postUpdate.upVotes.includes(loggedInUserId));
        setDownVoted(postUpdate.downVotes.includes(loggedInUserId));
      } else if (postUpdate.type === "share") {
        setShareCountState(postUpdate.shareCount);
      }
    }
  }, [postUpdate, PostId, loggedInUserId]);

  const handleUpvote = async () => {
    try {
      const result = await upvotePost(PostId);
      if (result && socket) {
        socket.emit("postUpvoted", {
          postId: PostId,
          upVotes: result.upVotes,
          downVotes: result.downVotes,
        });
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  const handleDownvote = async () => {
    try {
      const result = await downvotePost(PostId);
      if (result && socket) {
        socket.emit("postDownvoted", {
          postId: PostId,
          upVotes: result.upVotes,
          downVotes: result.downVotes,
        });
      }
    } catch (error) {
      console.error("Error downvoting:", error);
    }
  };

  return (
    <div className="flex justify-center mt-5">
      <div className="flex space-x-4">
        <Button
          className="bg-green-950 rounded-xl py-1 space-x-1 px-2 flex justify-center items-center"
          onClick={handleUpvote}>
          <IoArrowUpOutline
            size={20}
            className={upVoted ? "text-green-500" : "text-gray-500"}
          />
          <p className="text-sm text-gray-500">{upVotesCount}</p>
        </Button>
        <Button
          className="bg-red-950  rounded-xl py-1 space-x-1 px-2 flex justify-center items-center"
          onClick={handleDownvote}>
          <IoArrowDownOutline
            size={20}
            className={downVoted ? "text-red-500" : "text-gray-500"}
          />
          <p className="text-sm text-gray-500">
            {downVotesCount > 0 ? "-" : ""}
            {downVotesCount}
          </p>
        </Button>
        <Link
          className="flex items-center"
          to={`/${category}/PostDetail/${PostId}`}>
          <div className="flex items-center space-x-1">
            <IoChatbubbleOutline size={20} className="text-gray-500" />
            <p className="text-sm text-gray-500">{comments}</p>
          </div>
        </Link>
        <ShareBtn postID={PostId} shareCount={shareCountState} />
      </div>
    </div>
  );
};

export default ReactionSection;
