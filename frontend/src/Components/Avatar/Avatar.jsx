import React from "react";
import OnlineStatus from "../../Utils/OnlineStatus";
import { useSocketContext } from "../../Context/SocketContext";
import getProfilePicUrl from "../../Utils/GetProfilePicUrl";
import TuncateAltForImg from "../../Utils/TruncateAltForImg";

const Avatar = ({ ProfilePic, username, userId }) => {
  const { onlineUsers } = useSocketContext();

  return (
    <div className="relative w-10 h-10 mr-2">
      <img
        className=" object-cover rounded-full mr-2 w-full h-full border-2 border-slate-400 border-b-cyan-500"
        src={
          ProfilePic
            ? getProfilePicUrl(ProfilePic)
            : "https://res.cloudinary.com/dp9d2rdk2/image/upload/v1729168009/wlmsv7nq0mwsii2rmdye.png"
        }
        alt={TuncateAltForImg(username)}
      />
      {OnlineStatus(userId, onlineUsers) && (
        <>
          <div className="absolute top-1 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-slate-800"></div>
          <div className="absolute animate-pulse top-1 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-slate-800"></div>
        </>
      )}
    </div>
  );
};

export default Avatar;
