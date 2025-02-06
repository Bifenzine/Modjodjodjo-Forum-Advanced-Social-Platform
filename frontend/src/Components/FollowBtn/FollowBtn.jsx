import { Button } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import useFollow from "../../Hooks/UserHooks/useFollow";
import { useAuthContext } from "../../Context/AuthContext";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

const FollowBtn = ({ userID, userName, followers, following }) => {
  const { follow, loading } = useFollow();
  const [isFollowing, setIsFollowing] = useState(false); // State to track if authenticated user is following this user
  const { authUser } = useAuthContext();

  useEffect(() => {
    // Check if the authenticated user is already following this user
    setIsFollowing(authUser?.following.includes(userID));
  }, [authUser, userID]);

  // console.log(userID);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        // Unfollow user
        await follow(userID);
        toast.success(`You have unfollowed ${userName}!`);
      } else {
        // Follow user
        await follow(userID);
        toast.success(`You have followed ${userName}!`);
      }
      setIsFollowing((prevState) => !prevState); // Toggle the state
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  return (
    <>
      {authUser ? (
        <Button
          className="px-4 py-2 bg-background-dark border border-primary-dark"
          disabled={loading}
          onClick={handleFollowToggle}>
          {isFollowing ? "Unfollow" : "Follow"}
          {loading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : null}
        </Button>
      ) : (
        <Button
          className="px-4 py-2 bg-background-dark border border-primary-dark"
          disabled={true}
          onClick={handleFollowToggle}>
          Follow
        </Button>
      )}
    </>
  );
};

export default FollowBtn;
