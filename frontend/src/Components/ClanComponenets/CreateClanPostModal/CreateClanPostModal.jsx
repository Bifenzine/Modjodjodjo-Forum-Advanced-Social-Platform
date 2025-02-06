import React, { useEffect, useRef, useState } from "react";
import SelectCategory from "../../SelectCategory/SelectCategory";
import { getAllCategories } from "../../../DataFetching/DataFetching";
import ImagePicker from "../../ImagePicker/ImagePicker";
import useCreateClanPost from "../../../Hooks/ClanHooks/ClanPostHooks/useCreateClanPost";
import { useParams } from "react-router-dom";
import { Loader } from "lucide-react";

const CreateClanPostModal = ({ onclose, clanInfo, createClanPost }) => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(clanInfo?.clanCategory?._id);
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);

  const MAX_TITLE_LENGTH = 200;
  const MAX_CONTENT_LENGTH = 2000;

  useEffect(() => {
    getAllCategories()
      .then((data) => {
        setCategories(data.data);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value.slice(0, MAX_TITLE_LENGTH);
    setTitle(newTitle);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value.slice(0, MAX_CONTENT_LENGTH);
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

  const cancelPost = () => {
    fileInputRef.current.value = "";
    onclose();
  };

  const { Loading } = useCreateClanPost();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);
    if (image) {
      formData.append("photo", image);
    }
    onclose();

    await createClanPost(id, formData);
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="fixed top-0 left-0 w-full h-full  bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-slate-900 w-3/4 p-6 rounded-lg border-slate-700 border shadow-sm shadow-slate-400">
          <h2 className="text-2xl mb-4">Create Post</h2>

          <div className="mt-4">
            <label className="text-slate-400" htmlFor="name">
              Title
            </label>
            <div className="relative">
              <input
                className="w-full bg-slate-900 border rounded-md border-slate-700 text-slate-400 px-2 py-1 pr-16"
                type="text"
                value={title}
                onChange={handleTitleChange}
                maxLength={MAX_TITLE_LENGTH}
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
                {MAX_TITLE_LENGTH - title.length}
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
                value={content}
                onChange={handleContentChange}
                maxLength={MAX_CONTENT_LENGTH}></textarea>
              <span className="absolute right-2 bottom-2 text-slate-500 text-sm">
                {MAX_CONTENT_LENGTH - content.length}
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
              />
            </div>
          </div>

          <div className="mt-4 gap-2 flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-slate-900 border border-slate-700 text-slate-400 rounded-md px-4 py-1 hover:bg-gray-200 hover:text-gray-900"
              type="button"
              disabled={Loading}>
              {Loading ? (
                <Loader className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Create"
              )}
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

export default CreateClanPostModal;
