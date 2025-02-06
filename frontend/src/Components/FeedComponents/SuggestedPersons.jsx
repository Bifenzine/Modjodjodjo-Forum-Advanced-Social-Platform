import React, { useEffect, useState } from "react";
import FollowBtn from "../FollowBtn/FollowBtn";
import { getSuggestedUserstoFollow } from "../../DataFetching/DataFetching";
import getProfilePicUrl from "../../Utils/GetProfilePicUrl";
import truncateUsername from "../../Utils/Truncate";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import OnlineStatus from "../../Utils/OnlineStatus";
import { useSocketContext } from "../../Context/SocketContext";
import Avatar from "../Avatar/Avatar";

const SuggestedPersons = () => {
  const [usersToFollow, setUsersToFollow] = useState([]);

  useEffect(() => {
    getSuggestedUserstoFollow()
      .then((response) => {
        if (response) {
          setUsersToFollow(response);
          // console.log(response);
        } else {
          console.error("suggested users not found");
        }
      })
      .catch((err) => {
        console.log(err);
      });
    // add users to follow in the array to make it change when new users are added
  }, []);

  if (usersToFollow.length === 0) {
    return (
      <div className="bg-background-dark p-3 shadow-md rounded-2xl">
        <h2 className="text-xl font-bold mb-1">List of modjoos </h2>
        <motion.hr
          style={{
            scaleX: 0,
            transformOrigin: "left",
          }}
          animate={{ scaleX: 1.2 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="w-[8rem] mb-4 "></motion.hr>

        <ul className=" border-2 p-2 border-primary rounded-2xl">
          <li className="flex justify-center items-center mb-3">
            No suggested users to follow
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-background-dark p-3 shadow-md rounded-2xl">
      <h2 className="text-xl font-bold mb-1">List of modjoos </h2>
      <motion.hr
        style={{
          scaleX: 0,
          transformOrigin: "left",
        }}
        animate={{ scaleX: 1.2 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="w-[8rem] mb-4 "></motion.hr>

      <ul className=" border-2 p-2 border-primary rounded-2xl">
        {usersToFollow.map((user) => (
          <li key={user._id} className="flex justify-between items-center mb-3">
            <Link to={`/profile/${user._id}`}>
              <div className="flex items-center">
                <Avatar
                  ProfilePic={user.profilePic}
                  username={user.username}
                  userId={user._id}
                />

                <span>{truncateUsername(user.username)}</span>
              </div>
            </Link>
            <span>
              <FollowBtn userID={user._id} userName={user.username} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestedPersons;
