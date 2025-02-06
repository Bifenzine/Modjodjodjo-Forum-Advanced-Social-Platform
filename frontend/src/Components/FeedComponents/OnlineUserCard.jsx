import React from "react";
import { Link } from "react-router-dom";
import Avatar from "../Avatar/Avatar";
import truncateUsername from "../../Utils/Truncate";

const OnlineUserCard = ({ key, userID, username, profilePic }) => {
  return (
    <Link
      to={`/profile/${userID}`}
      key={key}
      className="flex flex-col items-center">
      <Avatar ProfilePic={profilePic} username={username} userId={userID} />
      <span className="text-white text-xs font-light">
        {truncateUsername(username)}
      </span>
    </Link>
  );
};

export default OnlineUserCard;
