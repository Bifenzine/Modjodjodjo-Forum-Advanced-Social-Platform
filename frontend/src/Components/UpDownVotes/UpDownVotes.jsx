import React, { useEffect, useState } from "react";
import {
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
} from "@mui/icons-material";
import { useAuthContext } from "../../Context/AuthContext";
import useUpvotePost from "../../Hooks/UpDownVotesHooks/useUpVotes";
import useDownvotePost from "../../Hooks/UpDownVotesHooks/useDownVotes";
import { useParams } from "react-router-dom";
import { useSocketContext } from "../../Context/SocketContext";

const UpDownVotes = ({ postDetail }) => {
  const { id } = useParams();
  const { authUser } = useAuthContext();
  const { postUpdate, socket } = useSocketContext();
  const loggedInUserId = authUser?._id;

  const [upVotes, setUpVotes] = useState([]);
  const [downVotes, setDownVotes] = useState([]);
  const [upVoted, setUpVoted] = useState(false);
  const [downVoted, setDownVoted] = useState(false);

  const { upvotePost, loading } = useUpvotePost();
  const { downvotePost, LoadingDownvote } = useDownvotePost();

  // Update state when postDetail changes
  useEffect(() => {
    if (postDetail) {
      setUpVotes(postDetail.upVotes || []);
      setDownVotes(postDetail.downVotes || []);
    }
  }, [postDetail]);

  // Update upVoted and downVoted states
  useEffect(() => {
    setUpVoted(upVotes.includes(loggedInUserId));
    setDownVoted(downVotes.includes(loggedInUserId));
  }, [upVotes, downVotes, loggedInUserId]);

  // Handle socket updates
  useEffect(() => {
    if (postUpdate && postUpdate.postId === id) {
      setUpVotes(postUpdate.upVotes);
      setDownVotes(postUpdate.downVotes);
    }
  }, [postUpdate, id]);

  const handleUpvote = async () => {
    try {
      const result = await upvotePost(id);
      if (result && socket) {
        socket.emit("postUpvoted", {
          postId: id,
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
      const result = await downvotePost(id);
      if (result && socket) {
        socket.emit("postDownvoted", {
          postId: id,
          upVotes: result.upVotes,
          downVotes: result.downVotes,
        });
      }
    } catch (error) {
      console.error("Error downvoting:", error);
    }
  };

  return (
    <>
      <span className="border border-slate-600 rounded-lg px-2 py-1 gap-4">
        {upVotes.length}{" "}
        <ArrowUpwardOutlined
          className={loading ? "animate-bounce" : "cursor-pointer"}
          style={{ color: upVoted ? "green" : "inherit" }}
          onClick={handleUpvote}
        />
        <span className="px-4">| </span>
        {downVotes.length === 0 ? null : "-"}
        {downVotes.length}{" "}
        <ArrowDownwardOutlined
          className={LoadingDownvote ? "animate-bounce" : "cursor-pointer"}
          style={{ color: downVoted ? "red" : "inherit" }}
          onClick={handleDownvote}
        />
      </span>
    </>
  );
};

export default UpDownVotes;
