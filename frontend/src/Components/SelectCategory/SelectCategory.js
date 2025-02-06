import React from "react";

const SelectCategory = ({ categories, handleCategory }) => {
  return (
    <>
      <div className="bg-slate-900 rounded-lg w-full">
        <label className="text-slate-400 text-sm px-1">Select Category:</label>
        <div className="w-full appearance-none bg-transparent outline-none border border-slate-700 rounded-md">
          <div className="w-full flex items-center">
            <select
              onChange={(e) => handleCategory(e.target.value)}
              value={categories._id} // Set value of select to selectedCategoryId
              className="md:text-sm md:w-full text-xs  text-white bg-slate-800 outline-none rounded-lg"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}
                className="md:text-sm md:w-full text-xs">
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectCategory;
