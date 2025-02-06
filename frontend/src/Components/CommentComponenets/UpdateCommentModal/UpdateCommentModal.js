import React, { useRef, useState } from "react";
import useUpdateComment from "../../../Hooks/CommentsHooks/useUpdateComment";
import ImagePicker from "../../ImagePicker/ImagePicker";
import { Loader } from "lucide-react";

const UpdateCommentModal = ({
  commentId,
  commentContent,
  commentImage,
  closeModal,
}) => {
  const [content, setContent] = useState(commentContent);
  const [image, setImage] = useState(commentImage);

  const MAX_COMMENT_LENGTH = 1000;

  const { updateComment, loading } = useUpdateComment();

  const handleContentChange = (e) => {
    const newContent = e.target.value.slice(0, MAX_COMMENT_LENGTH);
    setContent(newContent);
  };

  const fileInputRef = useRef(image);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleBtnClick = () => {
    fileInputRef.current.click();
  };

  const cancelUpdatePicComment = () => {
    fileInputRef.current.value = "";
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
      const updateUserComment = await updateComment(formData, commentId);
      console.log("Updated comment:", updateUserComment);
      setContent("");
      setImage(null);
      closeModal();
    } catch (error) {
      console.log("Error in update comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="fixed top-0 left-0 w-full h-full  bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-slate-900 w-3/4 p-6 rounded-lg border-slate-700 border shadow-sm shadow-slate-400">
          <h2 className="text-2xl mb-4">Update Comment</h2>

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
                maxLength={MAX_COMMENT_LENGTH}></textarea>
              <span className="absolute right-2 bottom-2 text-slate-500 text-sm">
                {content.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-row space-x-2">
            <div className="flex-1">
              <ImagePicker
                fileInputRef={fileInputRef}
                handleBtnClick={handleBtnClick}
                handleFileChange={handleFileChange}
                cancelPost={cancelUpdatePicComment}
                existingImage={commentImage}
              />
            </div>
          </div>

          <div className="mt-4 gap-2 flex justify-end">
            <button
              className="bg-slate-900 border border-slate-700 text-slate-400 rounded-md px-4 py-1 hover:bg-gray-200 hover:text-gray-900"
              type="submit"
              disabled={loading}>
              {loading ? (
                <Loader className="animate-spin w-4 h-4 mx-auto" />
              ) : (
                "Update"
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

export default UpdateCommentModal;
