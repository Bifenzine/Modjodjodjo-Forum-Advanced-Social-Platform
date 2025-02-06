import { Button } from "@material-tailwind/react";
import { ShareOutlined } from "@mui/icons-material";
import React, { useState } from "react";
import {
  FacebookShareButton,
  FacebookShareCount,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";
import useSharePost from "../../Hooks/PostHooks/useSharePost";
import ShareModal from "./ShareModal";

const ShareBtn = ({ postID, shareCount, postTitle }) => {
  // to check if we are in the post detail page
  const pathToCheckIfInPostDetail = window.location.pathname.split("/")[2];

  const [openShareModal, setOpenShareModal] = useState(false);

  const handleOpenShareModal = () => {
    setOpenShareModal((pervStat) => !pervStat);
  };

  return (
    <>
      <button
        className="py-1 space-x-1 rounded-xl px-2 flex justify-center items-center bg-gray-800 text-white hover:bg-gray-700"
        onClick={handleOpenShareModal}>
        <ShareOutlined size={20} className="text-gray-500" />
        <p className="text-sm text-gray-500">
          {pathToCheckIfInPostDetail === "PostDetail" ? "" : shareCount}
        </p>
      </button>

      {openShareModal && (
        <ShareModal
          onClose={handleOpenShareModal}
          postID={postID}
          postTitle={postTitle}
        />
      )}
    </>
  );
};

export default ShareBtn;
