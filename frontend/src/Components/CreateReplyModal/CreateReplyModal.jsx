import React, { useRef, useState } from "react";
import ImagePicker from "../ImagePicker/ImagePicker";
import useCreateReply from "../../Hooks/replyHooks/useCreateReply";
import { Loader } from "lucide-react";

const CreateReplyModal = ({ commentId, closeModal }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");

  const MAX_REPLY_LENGTH = 1000;

  const { createReply, loadingReply } = useCreateReply();

  const handleContentChange = (e) => {
    const newContent = e.target.value.slice(0, MAX_REPLY_LENGTH);
    setContent(newContent);
  };

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleBtnClick = () => {
    fileInputRef.current.click();
  };

  const cancelReplyPic = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", content);
    if (image) {
      formData.append("photo", image);
    }

    console.log("Content:", formData.get("content"));
    console.log("Photo:", formData.get("photo"));

    try {
      const createUserReply = await createReply(formData, commentId);
      console.log("reply created:", createUserReply);
      setContent("");
      setImage(null);
      closeModal();
    } catch (error) {
      console.log("error in create reply:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-slate-900 w-[30rem] p-6 rounded-lg border-slate-700 border shadow-sm shadow-slate-400">
          <h2 className="text-2xl mb-4">Create Reply</h2>

          <div className="mt-4">
            <label className="text-slate-400" htmlFor="content">
              Content
            </label>
            <div className="relative">
              <textarea
                className="w-full bg-slate-900 rounded-md border h-[10rem] border-slate-700 text-slate-400 px-2 py-1 pr-16"
                id="content"
                value={content}
                onChange={handleContentChange}
                maxLength={MAX_REPLY_LENGTH}></textarea>
              <span className="absolute right-2 bottom-2 text-slate-500 text-sm">
                {content.length}/{MAX_REPLY_LENGTH}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-row space-x-2">
            <div className="flex-1">
              <ImagePicker
                fileInputRef={fileInputRef}
                handleBtnClick={handleBtnClick}
                handleFileChange={handleFileChange}
                cancelPost={cancelReplyPic}
              />
            </div>
          </div>

          <div className="mt-4 gap-2 flex justify-end">
            <button
              className="bg-slate-900 border border-slate-700 text-slate-400 rounded-md px-4 py-1 hover:bg-gray-200 hover:text-gray-900"
              type="submit">
              {loadingReply ? (
                <Loader className="animate-spin w-5 h-5 mx-auto" />
              ) : (
                "Reply"
              )}
            </button>
            <button
              onClick={closeModal}
              className="bg-slate-900 border border-slate-700 text-slate-400 rounded-md px-4 py-1 hover:bg-gray-200 hover:text-gray-900"
              type="button">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateReplyModal;
