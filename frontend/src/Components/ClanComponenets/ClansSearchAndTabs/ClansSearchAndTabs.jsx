import React, { useEffect, useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import CreateClan from "../CreateClan/CreateClan";
import { getClans } from "../../../DataFetching/DataFetching";
import ClanCategories from "../ClanCategoriesTabs/ClanCategories";
import useCreateClan from "../../../Hooks/ClanHooks/useCreateClan";
import UploadProgressToast from "../../Toasts/UploadProgressToast";

const ClansSearchAndTabs = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [allClans, setAllClans] = useState([]);
  const [filteredClans, setFilteredClans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { createClan, progress, toastStatus, setToastStatus, Loading } =
    useCreateClan();

  useEffect(() => {
    getClans()
      .then((data) => {
        setAllClans(data.data);
        setFilteredClans(data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    const filtered = allClans.filter(
      (clan) =>
        clan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clan.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClans(filtered);
  }, [searchTerm, allClans]);

  const handleCloseModal = () => {
    setIsCreateModalOpen((prevState) => !prevState);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <div className="w-full bg-background-dark rounded-3xl shadow-xl p-2 sm:p-2">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-2/3">
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
            <motion.input
              whileFocus={{ scale: 1.02 }}
              className="w-full rounded-full px-10 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              type="text"
              placeholder="Search for clans..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCloseModal}
            className="w-full sm:w-auto px-6 py-2 bg-purple-600 text-white rounded-full flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors duration-300">
            <FaPlus />
            Create Clan
          </motion.button>
        </div>

        <ClanCategories initialClans={filteredClans} />

        <div className="flex justify-between mt-4 text-xs text-gray-400">
          <span>⌘K to search</span>
          <span>↑↓ to navigate</span>
          <span>⏎ to select</span>
        </div>

        {isCreateModalOpen && (
          <CreateClan onCancel={handleCloseModal} createClan={createClan} />
        )}
      </div>
      <UploadProgressToast
        title={`Creating New Clan`}
        isVisible={toastStatus !== "idle"}
        progress={progress}
        status={toastStatus}
        onDismiss={() => setToastStatus("idle")}
      />
    </>
  );
};

export default ClansSearchAndTabs;
