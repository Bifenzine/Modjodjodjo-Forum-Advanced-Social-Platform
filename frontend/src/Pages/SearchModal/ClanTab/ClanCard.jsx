import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import getProfilePicUrl from "../../../Utils/GetProfilePicUrl";

const ClanCard = ({ name, image, members }) => {
  // Truncate name if it exceeds 10 characters
  const truncatedName = name.length > 10 ? `${name.substring(0, 10)}...` : name;

  return (
    <div className="flex items-start p-4 bg-transparent border border-slate-700 rounded-lg shadow-md">
      {image ? (
        <motion.div
          className="w-12 h-12 rounded-full overflow-hidden"
          initial={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
          animate={{
            borderColor: [
              "rgba(255, 255, 255, 0.1)",
              "rgba(255, 0, 0, 0.5)",
              "rgba(0, 255, 0, 0.5)",
              "rgba(0, 0, 255, 0.5)",
              "rgba(255, 255, 255, 0.1)",
            ],
          }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{ borderWidth: "2px", borderStyle: "solid" }}>
          <img
            src={getProfilePicUrl(image)}
            alt={name}
            className="w-full h-full object-cover"
          />
        </motion.div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center relative">
          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-600">
            {name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </span>
        </div>
      )}
      <div className="ml-4 flex-1">
        <div className="flex items-center">
          <h4 className="text-lg font-semibold truncate">{truncatedName}</h4>
        </div>
        <p className="text-gray-500">{members} members</p>
      </div>
    </div>
  );
};

export default ClanCard;
