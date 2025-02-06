import React from "react";
import {
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoEyeOutline,
} from "react-icons/io5";
import getProfilePicUrl from "../../../Utils/GetProfilePicUrl";
import { Link } from "react-router-dom";
import displayMedia from "../../../Utils/displayMediaBasedOnExtension";

const PostP = ({
  PostId,
  img,
  pic,
  category,
  title,
  name,
  upVotes,
  downVotes,
}) => {
  const totalVotes = (upVotes?.length || 0) - (downVotes?.length || 0);
  const voteColor =
    totalVotes > 0
      ? "text-green-500"
      : totalVotes < 0
      ? "text-red-500"
      : "text-gray-500";

  return (
    <div className="break-inside-avoid mb-4">
      <Link to={`/${category}/PostDetail/${PostId}`} className="block">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
          {img && (
            <div className="relative overflow-hidden">
              <div className="aspect-w-1 aspect-h-1">
                {displayMedia(img, title)}
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                <IoEyeOutline className="w-12 h-12 text-white" />
              </div>
            </div>
          )}
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
              {title}
            </h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                {category}
              </span>
              <div className={`flex items-center space-x-1 ${voteColor}`}>
                {totalVotes > 0 ? (
                  <IoArrowUpOutline className="w-4 h-4" />
                ) : (
                  <IoArrowDownOutline className="w-4 h-4" />
                )}
                <span className="text-xs font-medium">
                  {Math.abs(totalVotes)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <img
                src={getProfilePicUrl(pic)}
                alt={name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {name}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PostP;
