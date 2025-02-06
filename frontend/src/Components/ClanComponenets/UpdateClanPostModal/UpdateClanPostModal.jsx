import React, { useEffect, useRef, useState } from "react";
import SelectCategory from "../../SelectCategory/SelectCategory";
import { getAllCategories } from "../../../DataFetching/DataFetching";
import ImagePicker from "../../ImagePicker/ImagePicker";
import useEditClanPost from "../../../Hooks/ClanHooks/ClanPostHooks/useEditClanPost";
import { useParams } from "react-router-dom";
import useUpdatePost from "../../../Hooks/PostHooks/useUpdatePost";
import { Loader } from "lucide-react";

const UpdateClanPostModal = ({
  onclose,
  PostId,
  title,
  content,
  postImage,
  clan,
  category,
  clanInfo,
  editClanPost,
  updatePost,
}) => {
  console.log(category);

  const [postTitle, setPostTitle] = useState(title);
  const [PostContent, setPostContent] = useState(content);
  const [ClanCategory, setClanCategory] = useState(category?._id);
  const [image, setImage] = useState(postImage);
  const [imageDeleted, setImageDeleted] = useState(false);

  const MAX_TITLE_LENGTH = 100; // You can adjust this value as needed
  const MAX_CONTENT_LENGTH = 1000; // You can adjust this value as needed

  const handleTitleChange = (e) => {
    const newTitle = e.target.value.slice(0, MAX_TITLE_LENGTH);
    setPostTitle(newTitle);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value.slice(0, MAX_CONTENT_LENGTH);
    setPostContent(newContent);
  };

  const fileInputRef = useRef(image);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImageDeleted(false);
  };

  const handleBtnClick = () => {
    fileInputRef.current.click();
  };

  const cancelPost = () => {
    fileInputRef.current.value = "";
    setImage(null);
    setImageDeleted(true);
  };

  const { loadingClan } = useEditClanPost();
  const { loading } = useUpdatePost();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", postTitle);
    formData.append("content", PostContent);
    formData.append("category", ClanCategory);
    if (image && !imageDeleted) {
      formData.append("photo", image);
    }
    if (imageDeleted) {
      formData.append("imageDeleted", "true");
    }

    console.log("title:", formData.get("title"));
    console.log("Content:", formData.get("content"));
    console.log("Category:", formData.get("category"));
    console.log("Photo:", formData.get("photo"));
    onclose();

    {
      clan?._id
        ? await editClanPost(PostId, formData)
        : await updatePost(PostId, formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-slate-900 w-3/4 p-6 rounded-lg border-slate-700 border shadow-sm shadow-slate-400">
          <h2 className="text-2xl mb-4">Update Post</h2>

          <div className="mt-4">
            <label className="text-slate-400" htmlFor="name">
              Title
            </label>
            <div className="relative">
              <input
                className="w-full bg-slate-900 border rounded-md border-slate-700 text-slate-400 px-2 py-1 pr-16"
                type="text"
                value={postTitle}
                onChange={handleTitleChange}
                maxLength={MAX_TITLE_LENGTH}
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
                {postTitle.length}/{MAX_TITLE_LENGTH}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-slate-400" htmlFor="content">
              Content
            </label>
            <div className="relative">
              <textarea
                className="w-full bg-slate-900 rounded-md border h-[10rem] border-slate-700 text-slate-400 px-2 py-1 pr-16"
                id="content"
                value={PostContent}
                onChange={handleContentChange}
                maxLength={MAX_CONTENT_LENGTH}></textarea>
              <span className="absolute right-2 bottom-2 text-slate-500 text-sm">
                {PostContent.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-row space-x-2">
            <div className="flex-1">
              <ImagePicker
                fileInputRef={fileInputRef}
                handleBtnClick={handleBtnClick}
                handleFileChange={handleFileChange}
                cancelPost={cancelPost}
                existingImage={postImage}
              />
            </div>
          </div>

          <div className="mt-4 gap-2 flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-slate-900 border border-slate-700 text-slate-400 rounded-md px-4 py-1 hover:bg-gray-200 hover:text-gray-900"
              type="button"
              disabled={loading || loadingClan}>
              {loading ? <Loader className="mx-auto animate-spin" /> : "update"}
              {loadingClan ? <Loader className="mx-auto animate-spin" /> : ""}
            </button>
            <button
              onClick={onclose}
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

export default UpdateClanPostModal;
