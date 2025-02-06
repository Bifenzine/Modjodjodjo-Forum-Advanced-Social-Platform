import React from "react";
import { FaUserFriends, FaPlus } from "react-icons/fa";
import ClanCrudMenu from "../ClanCrudMenu/ClanCrudMenu";
import { useAuthContext } from "../../../Context/AuthContext";
import { Button } from "@mui/material";
import useJoinClan from "../../../Hooks/ClanHooks/useJoinClan";
import toast from "react-hot-toast";
import { useSocketContext } from "../../../Context/SocketContext";
import { RiRadioButtonLine } from "react-icons/ri";
import { BsCreditCard2Front } from "react-icons/bs";
import getProfilePicUrl from "../../../Utils/GetProfilePicUrl";
import getHowManyClanUsersOnline from "../../../Utils/getHowManyClanUsersOnline";
import clanMemberCount from "../../../Utils/clanMemberCount";
import { Loader } from "lucide-react";
import { checkUserRole } from "../../../Utils/ClanHelperFunctios/CheckIfMemberOfClan";

const ClanPageHeader = ({ clanInfo }) => {
  const { authUser } = useAuthContext();
  const { isAdmin, isModerator, isMember } = checkUserRole(
    clanInfo,
    authUser?._id
  );

  const isAdminOrMod = isAdmin || isModerator;

  const { joinClan, loading, error } = useJoinClan();

  const handleJoinClan = async () => {
    const response = await joinClan(clanInfo?._id);
    if (response) {
      isMember
        ? toast.error("You left the clan!")
        : toast.success("Successfully joined the clan!");
    }
  };

  const { onlineUsers } = useSocketContext();

  const getButtonColor = (category) => {
    switch (category) {
      case "Anime":
        return "secondary";
      case "Sport":
        return "success";
      case "Music":
        return "warning";
      case "Technology":
        return "info";
      case "Education":
        return "primary";
      default:
        return "primary";
    }
  };

  if (!clanInfo) {
    return <div className="absolute bottom-0 w-full"> ...loading</div>;
  }

  return (
    <div className="relative max-w-4xl mx-auto p-4 sm:p-6 bg-slate-950 border border-slate-700 shadow-md rounded-lg">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          src={getProfilePicUrl(clanInfo?.bannerImage)}
          alt="Clan Banner"
          className="w-24 h-24 sm:w-32 sm:h-32 object-cover border-4 border-slate-500 rounded-full shadow-lg shadow-slate-800"
        />
        <div className="flex-1 w-full text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            {clanInfo?.name}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            {clanInfo?.description}
          </p>
          <Button
            className="w-full sm:w-auto"
            size="medium"
            variant="outlined"
            color={getButtonColor(clanInfo?.clanCategory?.name)}
            endIcon={
              isMember ? null : isAdmin ? null : isModerator ? null : <FaPlus />
            }
            onClick={isAdmin ? null : isModerator ? null : handleJoinClan}
            disabled={loading}>
            {loading ? (
              <Loader color="white" className="w-5 h-5 animate-spin mx-auto" />
            ) : error ? (
              error
            ) : null}
            <span className="font-bold text-sm sm:text-base">
              {isAdmin
                ? "Hey admin of "
                : isModerator
                ? "Hey mods of "
                : isMember
                ? "Joined "
                : "Join "}
              {clanInfo?.name}
            </span>
          </Button>
        </div>
      </div>
      <div className="mt-4 sm:mt-6 flex flex-wrap justify-center sm:justify-start gap-4 text-gray-500 text-sm sm:text-base">
        <div className="flex items-center">
          <BsCreditCard2Front className="mr-2" /> {clanInfo?.posts?.length}{" "}
          Posts
        </div>
        <div className="flex items-center">
          <FaUserFriends className="mr-2" />
          {clanMemberCount(clanInfo)} Members
        </div>
        <div className="flex items-center relative text-green-500">
          <RiRadioButtonLine className="mr-2 text-green-500 animate-ping" />
          <RiRadioButtonLine className="mr-2 absolute text-green-500" />{" "}
          {getHowManyClanUsersOnline(clanInfo, onlineUsers)} online
        </div>
      </div>
      {isAdminOrMod && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <ClanCrudMenu
            clanInfo={clanInfo}
            admin={isAdmin}
            mods={isModerator}
          />
        </div>
      )}
    </div>
  );
};

export default ClanPageHeader;
