import React, { useEffect, useRef, useState } from "react";
import SelectCategory from "../../SelectCategory/SelectCategory";
import { getAllCategories } from "../../../DataFetching/DataFetching";
import ImagePicker from "../../ImagePicker/ImagePicker";
import useEditClan from "../../../Hooks/ClanHooks/useEditClan";
import { Loader } from "lucide-react";

const UpdateClanModal = ({ clanInfo, onCancel, editClan }) => {
  const [name, setName] = useState(clanInfo?.name || "");
  const [description, setDescription] = useState(clanInfo?.description || "");
  const [clanCategory, setClanCategory] = useState(
    clanInfo?.clanCategory._id || ""
  );
  const [bannerImage, setBannerImage] = useState(clanInfo?.bannerImage);
  const [categories, setCategories] = useState([]);
  const [imageDeleted, setImageDeleted] = useState(false);

  const MAX_NAME_LENGTH = 100;
  const MAX_DESCRIPTION_LENGTH = 1000;

  const { loadingClan } = useEditClan();

  useEffect(() => {
    getAllCategories()
      .then((data) => {
        setCategories(data.data);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  const handleNameChange = (e) => {
    const newName = e.target.value.slice(0, MAX_NAME_LENGTH);
    setName(newName);
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value.slice(0, MAX_DESCRIPTION_LENGTH);
    setDescription(newDescription);
  };

  const handleCategoryChange = (categoryId) => {
    setClanCategory(categoryId);
  };

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setBannerImage(file);
    setImageDeleted(false);
  };

  const handleBtnClick = () => {
    fileInputRef.current.click();
  };

  const cancelPost = () => {
    fileInputRef.current.value = "";
    setBannerImage(null);
    setImageDeleted(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("clanCategory", clanCategory);
    if (bannerImage && !imageDeleted) {
      formData.append("photo", bannerImage);
    }
    if (imageDeleted) {
      formData.append("imageDeleted", "true");
    }
    onCancel();

    try {
      const updateCLAN = await editClan(formData, clanInfo?._id);
      console.log("Updated Clan:", updateCLAN);
    } catch (error) {
      console.error("Error updating Clan:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-slate-900 w-3/4 p-6 rounded-lg border-slate-700 border shadow-sm shadow-slate-400">
          <h2 className="text-2xl mb-4">Update Clan</h2>

          <div className="mt-4">
            <label className="text-slate-400" htmlFor="name">
              Name
            </label>
            <div className="relative">
              <input
                className="w-full bg-slate-900 border rounded-md border-slate-700 text-slate-400 px-2 py-1 pr-16"
                type="text"
                value={name}
                onChange={handleNameChange}
                maxLength={MAX_NAME_LENGTH}
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
                {name.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-slate-400" htmlFor="description">
              Description
            </label>
            <div className="relative">
              <textarea
                className="w-full bg-slate-900 rounded-md border h-[10rem] border-slate-700 text-slate-400 px-2 py-1 pr-16"
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                maxLength={MAX_DESCRIPTION_LENGTH}></textarea>
              <span className="absolute right-2 bottom-2 text-slate-500 text-sm">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-row space-x-2">
            <div className="flex-1">
              <SelectCategory
                categories={categories}
                handleCategory={handleCategoryChange}
                selectedCategory={clanCategory}
              />
            </div>

            <div className="flex-1">
              <ImagePicker
                fileInputRef={fileInputRef}
                handleBtnClick={handleBtnClick}
                handleFileChange={handleFileChange}
                cancelPost={cancelPost}
                existingImage={bannerImage}
              />
            </div>
          </div>

          <div className="mt-4 gap-2 flex justify-end">
            <button
              className="bg-slate-900 border border-slate-700 text-slate-400 rounded-md px-4 py-1 hover:bg-gray-200 hover:text-gray-900"
              type="submit"
              disabled={loadingClan}>
              {loadingClan ? (
                <Loader className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Update"
              )}
            </button>
            <button
              onClick={onCancel}
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

export default UpdateClanModal;
