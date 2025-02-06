import React, { useEffect, useRef, useState } from "react";
import SelectCategory from "../../SelectCategory/SelectCategory";
import { getAllCategories } from "../../../DataFetching/DataFetching";
import ImagePicker from "../../ImagePicker/ImagePicker";
import { Loader } from "lucide-react";
import UploadProgressToast from "../../Toasts/UploadProgressToast";

const UpdatePostModal = ({ postData, onUpdate, onCancel, loading }) => {
  const [title, setTitle] = useState(postData.title);
  const [content, setContent] = useState(postData.content);
  const [category, setCategory] = useState(postData.category);
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(postData.photo);
  const [categories, setCategories] = useState([]);
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);

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

  const handleCategoryChange = (categoryId) => {
    setCategory(categoryId);
  };

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setCurrentImage(URL.createObjectURL(file));
      setShouldDeleteImage(false);
    }
  };

  const handleBtnClick = () => {
    fileInputRef.current.click();
  };

  const cancelPost = () => {
    fileInputRef.current.value = "";
    setImage(null);
    setShouldDeleteImage(true);
    setCurrentImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);

    // Handle image cases
    if (image) {
      // New image uploaded
      formData.append("photo", image);
    } else if (shouldDeleteImage) {
      // Image was deleted
      formData.append("deletePhoto", "true");
    } else if (currentImage === postData.photo) {
      // Keep existing image
      formData.append("keepExistingPhoto", "true");
    }
    onCancel();

    onUpdate(formData);
  };

  return (
    <>
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
                  value={title}
                  onChange={handleTitleChange}
                  maxLength={MAX_TITLE_LENGTH}
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
                  {MAX_TITLE_LENGTH - title.length}/{MAX_TITLE_LENGTH}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-slate-400" htmlFor="content">
                Content
              </label>
              <div className="relative">
                <textarea
                  className="w-full bg-slate-900 rounded-md border h-40 border-slate-700 text-slate-400 px-2 py-1 pr-16"
                  id="content"
                  value={content}
                  onChange={handleContentChange}
                  maxLength={MAX_CONTENT_LENGTH}
                />
                <span className="absolute right-4 bottom-2 text-slate-500 text-sm">
                  {MAX_CONTENT_LENGTH - content.length}/{MAX_CONTENT_LENGTH}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-row space-x-2">
              <div className="flex-1">
                <SelectCategory
                  categories={categories}
                  handleCategory={handleCategoryChange}
                  selectedCategory={category}
                />
              </div>

              <div className="flex-1">
                <ImagePicker
                  fileInputRef={fileInputRef}
                  handleBtnClick={handleBtnClick}
                  handleFileChange={handleFileChange}
                  cancelPost={cancelPost}
                  existingImage={currentImage}
                />
              </div>
            </div>

            {/* for better view */}
            {/* {currentImage && (
            <div className="mt-4">
              <img
                src={currentImage}
                alt="Post preview"
                className="max-h-48 object-contain"
              />
            </div>
          )} */}

            <div className="mt-4 gap-2 flex justify-end">
              <button
                type="submit"
                className="bg-slate-900 border border-slate-700 text-slate-400 rounded-md px-4 py-1 hover:bg-gray-200 hover:text-gray-900"
                disabled={loading}>
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Update"
                )}
              </button>
              <button
                onClick={onCancel}
                type="button"
                className="bg-slate-900 border border-slate-700 text-slate-400 rounded-md px-4 py-1 hover:bg-gray-200 hover:text-gray-900">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default UpdatePostModal;
