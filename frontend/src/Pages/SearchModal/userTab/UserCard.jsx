import React from "react";
import { Link } from "react-router-dom";

const UserCard = ({ userID, name, image }) => {
  return (
    <Link to={`/profile/${userID}`}>
      <div className="flex flex-col items-center p-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <span className="mt-2 text-sm text-center text-white">{name}</span>
      </div>
    </Link>
  );
};

export default UserCard;
