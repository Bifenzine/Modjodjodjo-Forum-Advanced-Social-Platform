import React from "react";
import OnlineUserCard from "./OnlineUserCard";

const OnlineUserGrid = ({ OnlineUsers }) => {
  // console.log(OnlineUsers);

  if (OnlineUsers.length === 0) {
    return (
      <div className="text-white bg-slate-800 rounded-2xl p-2 flex flex-col justify-center items-center text-xs ">
        No Modjoos Online at the moment
        <span className="text-xl">😢</span>
      </div>
    );
  }

  return (
    <section className="flex justify-center items-center w-full">
      <div className="grid grid-cols-4 gap-4 border-2 border-slate-800 py-3 px-2 bg-slate-800 overflow-auto shadow-md rounded-2xl">
        {OnlineUsers.map((OnlineUser, index) => (
          <OnlineUserCard
            key={index}
            userID={OnlineUser?.id}
            username={OnlineUser?.username}
            profilePic={OnlineUser?.profilePic}
          />
        ))}
      </div>
    </section>
  );
};

export default OnlineUserGrid;
