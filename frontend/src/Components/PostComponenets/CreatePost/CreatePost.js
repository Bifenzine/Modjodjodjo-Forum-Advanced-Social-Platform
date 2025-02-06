import React, { useEffect, useRef, useState } from "react";
import { Send, FilePresentOutlined } from "@mui/icons-material";
import { motion } from "framer-motion";
import { CircularProgress, Tooltip } from "@mui/material";
import useCreatePost from "../../../Hooks/PostHooks/useCreatePost";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import SelectCategory from "../../SelectCategory/SelectCategory";
import { getAllCategories } from "../../../DataFetching/DataFetching";
import { useAuthContext } from "../../../Context/AuthContext";
import ImagePicker from "../../ImagePicker/ImagePicker";
import UploadProgressToast from "../../Toasts/UploadProgressToast";

const CreatePost = () => {
  const { authUser } = useAuthContext();
  const { id } = useParams();
  const { createPost, error, loading, progress, setToastStatus, toastStatus } =
    useCreatePost();

  const [categories, setCategories] = useState([]);
  const [text, setText] = useState({
    title: "",
    content: "",
    category: "",
    image: null,
  });
  const fileInputRef = useRef(null);
  const [clearPreview, setClearPreview] = useState(false);

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

  const handleBtnClick = () => {
    fileInputRef.current.click();
  };

  const handleSelectCategory = (category) => {
    setText({ ...text, category });
  };

  const cancelPost = () => {
    setText({
      title: "",
      content: "",
      category: "",
      image: null,
    });
    fileInputRef.current.value = "";
  };

  const cancelImage = () => {
    setText({
      ...text,
      image: null,
    });
    fileInputRef.current.value = "";
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setText({ ...text, image: file });
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value.slice(0, MAX_TITLE_LENGTH);
    setText({ ...text, title: newTitle });
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value.slice(0, MAX_CONTENT_LENGTH);
    setText({ ...text, content: newContent });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", text.title);
    formData.append("content", text.content);
    formData.append("category", text.category);
    if (text.image) {
      formData.append("photo", text.image);
    }

    console.log("title:", formData.get("title"));
    console.log("Content:", formData.get("content"));
    console.log("Category:", formData.get("category"));
    console.log("Photo:", formData.get("photo"));

    try {
      const createdPost = await createPost(formData, cancelPost);
      console.log("Created post:", createdPost);
      toast.success("Post created successfully");
      cancelPost();
      setClearPreview(true);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  useEffect(() => {
    if (clearPreview) {
      setClearPreview(false);
    }
  }, [clearPreview]);

  return (
    <>
      <form
        className="w-full justify-center items-center relative"
        onSubmit={handleSubmit}
        encType="multipart/form-data">
        {!authUser ? (
          <div className="absolute top-0 right-0 bottom-0 left-0 opacity-50 bg-black flex justify-center items-center">
            <Link to={"/Register"}>
              <button className="px-4 py-2 rounded-lg bg-slate-800 text-white">
                Not authorized login first
              </button>
            </Link>
          </div>
        ) : null}

        <div className="w-full flex justify-between items-center px-4 py-2">
          <span className="font-bold">Create a post</span>
        </div>
        <motion.hr
          style={{
            scaleX: 0,
            transformOrigin: "left",
          }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="w-[8rem] text-black"></motion.hr>
        <div className="flex justify-center items-center w-full px-2 py-2">
          <div className="w-full relative">
            <input
              className="w-full font-thin text-base px-1 py-1 rounded-sm bg-slate-900 border border-slate-500 pr-16"
              placeholder="title"
              onChange={handleTitleChange}
              value={text.title}
              maxLength={MAX_TITLE_LENGTH}
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
              {MAX_TITLE_LENGTH - text.title.length}
            </span>
          </div>
        </div>
        <div className="flex justify-center items-center w-full px-2 py-2">
          <div className="w-full relative">
            <textarea
              className="w-full font-thin text-base px-1 py-1 rounded-sm bg-slate-900 border border-slate-500 pr-16"
              placeholder="content"
              onChange={handleContentChange}
              value={text.content}
              rows="5"
              maxLength={MAX_CONTENT_LENGTH}></textarea>
            <span className="absolute right-2 bottom-2 text-slate-500 text-sm">
              {MAX_CONTENT_LENGTH - text.content.length}
            </span>
          </div>
        </div>
        <Tooltip title="Select a category is required">
          <div className="w-full justify-center items-center px-2 pb-2">
            <SelectCategory
              handleCategory={handleSelectCategory}
              categories={categories}
              selectedCategoryId={id}
            />
          </div>
        </Tooltip>
        <div className="w-full gap-2 grid  justify-start items-start p-2">
          <ImagePicker
            fileInputRef={fileInputRef}
            handleBtnClick={handleBtnClick}
            handleFileChange={handleFileChange}
            cancelPost={cancelImage}
            clearPreview={clearPreview}
          />
          <div className="w-full flex gap-2 items-center">
            <span
              className="w-[4rem] flex justify-center items-end hover:bg-slate-950 hover:text-white cursor-pointer border px-2 py-1 border-slate-500 rounded"
              onClick={cancelPost}>
              Cancel
            </span>
            <button
              className="bg-surface border border-primary px-2 rounded-lg hover:bg-slate-900 flex items-center"
              type="submit"
              disabled={loading}>
              {loading ? "creating ..." : ""}
              <span className="p-1">{loading ? "" : "create"}</span>
            </button>
          </div>
        </div>
      </form>
      <UploadProgressToast
        title={`Creating post: ${text.title}`}
        isVisible={toastStatus !== "idle"}
        progress={progress}
        status={toastStatus}
        onDismiss={() => setToastStatus("idle")}
      />
    </>
  );
};

export default CreatePost;
