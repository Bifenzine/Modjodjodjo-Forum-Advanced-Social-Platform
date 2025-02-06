import React, { useEffect, useState } from "react";
import { ClanPageHeader } from "../../Components";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClan,
  getTrendingPostsInClan,
  getPopularPostsInClan,
  getNewestPostsInClan,
} from "../../DataFetching/DataFetching";
import ClanPageTabs from "../../Components/ClanComponenets/ClanPageTabs/ClanPageTabs";
import StatClan from "../../Components/ClanComponenets/StatClan/StatClan";
import { FaChartBar } from "react-icons/fa";

const ClanDetail = () => {
  const { id } = useParams();
  const [clanInfo, setClanInfo] = useState({});
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [newestPosts, setNewestPosts] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clanData, trendingData, popularData, newestData] =
          await Promise.all([
            getClan(id),
            getTrendingPostsInClan(id),
            getPopularPostsInClan(id),
            getNewestPostsInClan(id),
          ]);

        setClanInfo(clanData?.data || {});
        setTrendingPosts(trendingData?.data || []);
        setPopularPosts(popularData?.data || []);
        setNewestPosts(newestData?.data || []);
      } catch (error) {
        console.error("Error fetching clan data:", error);
      }
    };

    fetchData();
  }, [id, clanInfo]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <main className="relative flex flex-col lg:flex-row justify-center items-start py-4 px-0 sm:px-4 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-[calc(20%)] left-2 sm:hidden
         z-50 p-2 sm:p-3 md:p-4 bg-primary-dark opacity-80 shadow-lg rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </button>
      <div className="w-full lg:w-3/4 flex-col justify-center items-center">
        <ClanPageHeader clanInfo={clanInfo} />
        <ClanPageTabs
          clanInfo={clanInfo}
          trendingPosts={trendingPosts}
          popularPosts={popularPosts}
          newestPosts={newestPosts}
        />
      </div>

      {/* Stat Clan Drawer Button (visible on medium devices) */}
      <button
        onClick={toggleDrawer}
        className="fixed bottom-36 right-4 md:bottom-24 md:right-4 z-50 lg:hidden bg-background-dark
         hover:bg-primary-dark
         text-white p-3 rounded-full shadow-lg transition-all duration-300 
         ease-in-out transform hover:scale-110
         border-2 border-primary"
        aria-label="Toggle Stat Clan">
        <FaChartBar size={24} />
      </button>

      {/* Stat Clan Drawer (for medium devices) */}
      <div
        className={`fixed inset-y-0 right-0 mb-16
      border-l-2 border-primary rounded-xl
         sm:mb-0 top-24 w-[20rem] 
          bg-background-dark shadow-lg transform 
          ${isDrawerOpen ? "translate-x-0" : "translate-x-full"} 
          transition-transform duration-300 ease-in-out lg:hidden`}>
        <button
          onClick={toggleDrawer}
          className="absolute left-4 p-3 bg-primary text-white hover:bg-surface"
          aria-label="Close drawer">
          &times;
        </button>
        <div className="p-4 mt-12">
          <StatClan />
        </div>
      </div>

      {/* Stat Clan Aside (for large devices) */}
      <aside className="hidden lg:block w-1/4 px-4 py-2 border-l-2 border-gray-200 dark:border-gray-700">
        <StatClan />
      </aside>
    </main>
  );
};

export default ClanDetail;
