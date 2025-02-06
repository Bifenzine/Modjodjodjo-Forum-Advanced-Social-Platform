import React, { useState, useEffect } from "react";
import {
  FaTwitter,
  FaFacebook,
  FaReddit,
  FaDiscord,
  FaWhatsapp,
  FaFacebookMessenger,
  FaTelegram,
  FaWeixin,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import useSharePost from "../../Hooks/PostHooks/useSharePost";
import toast from "react-hot-toast";
import { MdAttachFile } from "react-icons/md";
import {
  TwitterShareButton,
  WhatsappShareButton,
  FacebookShareButton,
  RedditShareButton,
  TelegramShareButton,
  FacebookMessengerShareButton,
} from "react-share";
import { Loader } from "lucide-react";
import config from "../../config/config";
import { useSocketContext } from "../../Context/SocketContext";

const ShareModal = ({ onClose, postID, postTitle, initialShareCount }) => {
  const { sharePost, LoadingShare } = useSharePost();
  const { postUpdate, socket } = useSocketContext();

  const [loading, setLoading] = useState(false);
  const [shareCount, setShareCount] = useState(initialShareCount);

  useEffect(() => {
    if (
      postUpdate &&
      postUpdate.postId === postID &&
      postUpdate.type === "share"
    ) {
      setShareCount(postUpdate.shareCount);
    }
  }, [postUpdate, postID]);

  const fullPath = `${config.frontendUrl}/${postID}/PostDetail/${postID}`;
  const shareUrl = `${config.frontendUrl}/${postID}/PostDetail/${postID}`;
  const title = postTitle;

  const copyToClipboardAndShare = async () => {
    try {
      setLoading(true);
      await navigator.clipboard.writeText(fullPath);
      toast.success("Copied to clipboard!");
      const result = await sharePost(postID);
      if (result && socket) {
        socket.emit("postShared", {
          postId: postID,
          shareCount: result.shareCount,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error copying to clipboard or sharing post:", error);
      toast.error("An error occurred while sharing");
      setLoading(false);
    }
  };

  const shareCountForSocialMedia = async () => {
    try {
      const result = await sharePost(postID);
      if (result && socket) {
        socket.emit("postShared", {
          postId: postID,
          shareCount: result.shareCount,
        });
      }
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("An error occurred while sharing");
    }
  };

  const iconStyle = "w-8 h-8";

  return (
    <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-lg p-6 w-80 md:w-96 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Share (Total: {shareCount})</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-gray-500">
            <IoClose size={24} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4 py-4">
          <TwitterShareButton
            url={shareUrl}
            title={title}
            className="flex flex-col items-center"
            onClick={shareCountForSocialMedia}>
            <FaTwitter
              className={`${iconStyle} text-blue-500 hover:text-blue-600`}
            />
            <span className="text-sm mt-2">Twitter</span>
          </TwitterShareButton>

          <FacebookShareButton
            url={shareUrl}
            quote={title}
            className="flex flex-col items-center"
            onClick={shareCountForSocialMedia}>
            <FaFacebook
              className={`${iconStyle} text-blue-700 hover:text-blue-800`}
            />
            <span className="text-sm mt-2">Facebook</span>
          </FacebookShareButton>

          <RedditShareButton
            url={shareUrl}
            title={title}
            className="flex flex-col items-center"
            onClick={shareCountForSocialMedia}>
            <FaReddit
              className={`${iconStyle} text-orange-500 hover:text-orange-600`}
            />
            <span className="text-sm mt-2">Reddit</span>
          </RedditShareButton>

          <div className="flex flex-col items-center">
            <FaDiscord
              className={`${iconStyle} text-indigo-500 hover:text-indigo-600`}
            />
            <span className="text-sm mt-2">Discord</span>
          </div>

          <WhatsappShareButton
            url={shareUrl}
            title={title}
            className="flex flex-col items-center"
            onClick={shareCountForSocialMedia}>
            <FaWhatsapp
              className={`${iconStyle} text-green-500 hover:text-green-600`}
            />
            <span className="text-sm mt-2">WhatsApp</span>
          </WhatsappShareButton>

          <FacebookMessengerShareButton
            url={shareUrl}
            appId="YOUR_FACEBOOK_APP_ID"
            className="flex flex-col items-center"
            onClick={shareCountForSocialMedia}>
            <FaFacebookMessenger
              className={`${iconStyle} text-blue-400 hover:text-blue-500`}
            />
            <span className="text-sm mt-2">Messenger</span>
          </FacebookMessengerShareButton>

          <TelegramShareButton
            url={shareUrl}
            title={title}
            className="flex flex-col items-center"
            onClick={shareCountForSocialMedia}>
            <FaTelegram
              className={`${iconStyle} text-blue-400 hover:text-blue-500`}
            />
            <span className="text-sm mt-2">Telegram</span>
          </TelegramShareButton>

          <div className="flex flex-col items-center">
            <FaWeixin
              className={`${iconStyle} text-green-600 hover:text-green-700`}
            />
            <span className="text-sm mt-2">WeChat</span>
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 p-2 rounded-l-lg bg-slate-950 text-slate-400"
          />
          <button
            className="bg-slate-900 p-2 rounded-r-lg hover:bg-slate-800"
            onClick={copyToClipboardAndShare}>
            {loading ? (
              <Loader className="animate-spin" size={24} />
            ) : (
              <MdAttachFile size={24} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
