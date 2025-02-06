import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Collapse,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { GrLike } from "react-icons/gr";
import useLikeReply from "../../../Hooks/replyHooks/useLikeReply";
import { useAuthContext } from "../../../Context/AuthContext";
import MenuCrudReply from "../MenuCrudReply/MenuCrudReply";
import getProfilePicUrl from "../../../Utils/GetProfilePicUrl";
import config from "../../../config/config";
import { Loader } from "lucide-react";

const CommentsReply = ({ comment }) => {
  const [open, setOpen] = useState(true);
  const { authUser } = useAuthContext();

  // received comment from parent component
  console.log(comment);

  const loggedInUserId = authUser?._id;

  const likedReply = comment.replies.some((reply) =>
    reply.likes.includes(loggedInUserId)
  );
  const [liked, setLiked] = useState(
    Array(comment.replies.length).fill(likedReply)
  );

  const { likeReply, loading } = useLikeReply();

  const toggleOpen = () => setOpen((cur) => !cur);

  const handleLikeReply = async (replyId) => {
    try {
      const updatedReply = await likeReply(replyId);
      const isLiked = updatedReply.likes.includes(loggedInUserId);
      setLiked((prev) => {
        const updatedLikes = [...prev];
        const replyIndex = comment.replies.findIndex(
          (reply) => reply._id === replyId
        );
        updatedLikes[replyIndex] = isLiked;
        return updatedLikes;
      });
    } catch (error) {
      // Handle the error
    }
  };

  return (
    <>
      <Button
        onClick={toggleOpen}
        className="border border-surface-light mt-2 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-4">
        {open
          ? "Shrink Reply"
          : comment?.replies?.length > 0 &&
            `View ${comment?.replies?.length} Replies`}
      </Button>
      <Collapse open={open}>
        {open && (
          <CardBody className="w-full p-1 sm:p-2">
            {comment?.replies?.map((reply, index) => (
              <div key={index} className="relative mb-2 sm:mb-4">
                <div className="w-full flex justify-start items-center border-l border-l-surface-light flex-col py-1 sm:py-2 px-2 sm:px-4 bg-background-dark rounded-lg">
                  <div className="flex gap-2 sm:gap-4 w-full justify-between items-center">
                    <div className="flex justify-center items-center gap-2 sm:gap-4">
                      <img
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                        src={getProfilePicUrl(
                          reply?.user?.profilePic ||
                            `${config.apiUrl}/${reply?.user?.profilePic}`
                        )}
                        alt=""
                      />
                      <span className="text-xs sm:text-sm">
                        {reply?.user?.username}
                      </span>
                    </div>
                    <MenuCrudReply reply={reply} />
                  </div>
                  <div className="w-full sm:w-[20rem] flex justify-start items-center mt-1 sm:mt-2 break-all flex-col">
                    <span className="w-full py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm">
                      {reply.content}
                    </span>
                    {reply?.photo && (
                      <div className="flex w-full px-2 sm:px-4 justify-start items-center mt-1 sm:mt-2">
                        <img
                          className="w-16 h-16 sm:w-28 sm:h-28 object-cover rounded-lg"
                          src={getProfilePicUrl(
                            reply?.photo || `${config.apiUrl}/${reply?.photo}`
                          )}
                          alt=""
                        />
                      </div>
                    )}
                    <div className="w-full flex justify-end items-center px-2 sm:px-4 mt-1 sm:mt-2">
                      <span className="py-1 px-2 sm:px-3 flex justify-center items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        {loading ? (
                          <GrLike
                            className="text-white animate-ping w-3 h-3 sm:w-4 sm:h-4"
                            onClick={() => handleLikeReply(reply._id)}
                          />
                        ) : (
                          <GrLike
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              liked[index] ? "text-blue-600" : "text-white"
                            }`}
                            onClick={() => handleLikeReply(reply._id)}
                          />
                        )}
                        {reply.likes?.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        )}
      </Collapse>
    </>
  );
};

export default CommentsReply;
