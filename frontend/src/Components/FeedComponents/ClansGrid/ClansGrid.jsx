import React, { useEffect, useState } from "react";
import ClansCard from "./ClansCard";
import { useAuthContext } from "../../../Context/AuthContext";
import { getClansthatTheUserBelongsTo } from "../../../DataFetching/DataFetching";

const ClansGrid = () => {
  const [clans, setClans] = useState([]);
  const { authUser } = useAuthContext();
  const userID = authUser?._id;

  useEffect(() => {
    if (userID) {
      getClansthatTheUserBelongsTo(userID)
        .then((data) => {
          setClans(data.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [userID]);

  // console.log(clans);

  if (clans.length === 0) {
    return (
      <div className="text-white p-2 flex flex-col justify-center items-center text-xs ">
        Join a clan to see it here
        <span className="text-xl">😢</span>
      </div>
    );
  }

  return (
    <section className="flex  items-center w-full">
      <div className="grid grid-cols-4 lg:grid-cols-5 gap-6 border-2 border-slate-800 py-3 px-2 bg-slate-800 overflow-auto shadow-md rounded-2xl">
        {clans.map((clan, index) => (
          <ClansCard
            key={index}
            clanID={clan?._id}
            clanName={clan?.name}
            clanPic={clan?.bannerImage}
          />
        ))}
      </div>
    </section>
  );
};

export default ClansGrid;
