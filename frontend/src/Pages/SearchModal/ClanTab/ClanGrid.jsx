import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ClanCard from "./ClanCard";
import clanMemberCount from "../../../Utils/clanMemberCount";

const ClanGrid = ({ clans }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {clans.map((clan, index) => (
          <motion.div
            key={clan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}>
            <Link to={`/Clans/clan/${clan._id}`} className="block h-full">
              <ClanCard
                name={clan.name}
                image={clan.bannerImage}
                members={clanMemberCount(clan)}
              />
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ClanGrid;
