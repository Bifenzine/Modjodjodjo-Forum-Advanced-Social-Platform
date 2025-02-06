import React from "react";
import { FaUsers, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../../Context/AuthContext";
import Chip from "@mui/material/Chip";
import Loader from "../../Loader/Loader";

const ClansCards = ({ clans }) => {
  const { authUser } = useAuthContext();

  if (!clans)
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader />
      </div>
    );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-6 p-2 sm:p-4">
      {clans.map((clan, index) => {
        const isMember = clan?.members?.some(
          (isMemb) => isMemb._id.toString() === authUser?._id.toString()
        );

        return (
          <Link to={`/Clans/clan/${clan?._id}`} key={index} className="group">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl">
              <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
                <img
                  src={
                    clan?.bannerImage
                      ? clan?.bannerImage
                      : "https://via.placeholder.com/400x200"
                  }
                  alt="Clan Banner"
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 truncate">
                    {clan?.name}
                  </h2>
                  <div className="flex items-center justify-between">
                    <Chip
                      label={clan?.clanCategory?.name}
                      variant="outlined"
                      size="small"
                      style={{ fontSize: "0.7rem", height: "20px" }}
                      color={
                        clan?.clanCategory?.name === "Anime"
                          ? "secondary"
                          : clan?.clanCategory?.name === "Sport"
                          ? "success"
                          : clan?.clanCategory?.name === "Music"
                          ? "warning"
                          : clan?.clanCategory?.name === "Technology"
                          ? "info"
                          : clan?.clanCategory?.name === "Education"
                          ? "primary"
                          : "primary"
                      }
                    />
                    <span className="text-gray-300 text-xs sm:text-sm flex items-center">
                      <FaUsers className="mr-1" />
                      {clan?.members.length +
                        clan?.admins.length +
                        clan?.moderators.length}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <p className="text-gray-300 text-xs sm:text-sm mb-3 line-clamp-2">
                  {clan?.description}
                </p>
                <div className="flex justify-between items-center text-primary-light">
                  <span className="text-sm sm:text-base font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
                    View Clan
                  </span>
                  <FaArrowRight className="text-blue-400 group-hover:text-blue-300 transform group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ClansCards;
