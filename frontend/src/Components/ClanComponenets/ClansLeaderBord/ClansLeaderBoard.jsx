// src/ClansLeaderBord.js
import React, { useEffect, useState } from "react";
import { FaTrophy, FaUserFriends } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import {
  getAllTimeRanking,
  getMonthlyRanking,
  getWeeklyRanking,
} from "../../../DataFetching/DataFetching";

const ClansLeaderBord = () => {
  const [allTimeData, setAllTimeData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allTimeResponse, monthlyResponse, weeklyResponse] =
          await Promise.all([
            getAllTimeRanking(),
            getMonthlyRanking(),
            getWeeklyRanking(),
          ]);

        setAllTimeData(allTimeResponse.data);
        setMonthlyData(monthlyResponse.data);
        setWeeklyData(weeklyResponse.data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="w-full mx-auto text-center">Loading...</div>;
  }

  return (
    <div className="w-full mx-auto bg-transparent shadow-md rounded-lg">
      <motion.hr
        style={{
          scaleX: 0,
          transformOrigin: "center",
        }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="w-full text-black mb-4"></motion.hr>

      <TabGroup>
        <TabList className="flex justify-center gap-4 mb-4">
          <Tab
            className={({ selected }) =>
              `rounded-full w-full py-1 px-3 text-sm font-semibold text-white focus:outline-none ${
                selected
                  ? "bg-purple-700 border border-slate-700"
                  : "hover:bg-white/10"
              }`
            }>
            AllTime
          </Tab>
          <Tab
            className={({ selected }) =>
              `rounded-full w-full py-1 px-3 text-sm font-semibold text-white focus:outline-none ${
                selected
                  ? "bg-purple-700 border border-slate-700"
                  : "hover:bg-white/10"
              }`
            }>
            monthly
          </Tab>
          <Tab
            className={({ selected }) =>
              `rounded-full w-full py-1 px-3 text-sm font-semibold text-white focus:outline-none ${
                selected
                  ? "bg-purple-700 border border-slate-700"
                  : "hover:bg-white/10"
              }`
            }>
            weekly
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Leaderboard data={allTimeData} />
          </TabPanel>
          <TabPanel>
            <Leaderboard data={monthlyData} />
          </TabPanel>
          <TabPanel>
            <Leaderboard data={weeklyData} />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

const Leaderboard = ({ data }) => (
  <main>
    {data?.map((clan, index) => (
      <Link to={`/Clans/clan/${clan?._id}`} key={index}>
        <li className="flex justify-between items-center px-2 py-2 border-b border-b-slate-600 last:border-0">
          <div className="flex items-center">
            <div className="w-16 h-16 relative mr-4">
              <span className="absolute bottom-0 left-0 text-2xl font-bold z-10">
                {index + 1}
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={
                    clan?.bannerImage
                      ? clan?.bannerImage
                      : "https://via.placeholder.com/100"
                  }
                  alt="Clan Banner"
                  className="w-14 h-14 object-cover rounded-full border-2 border-slate-500 shadow-lg shadow-slate-800"
                />
              </div>
            </div>
            <div>
              <span className="block font-bold">
                {clan?.name?.slice(0, 15)} {clan?.name?.length > 15 && "..."}
              </span>
              <div className="flex justify-start items-center gap-4">
                <span className="text-sm text-gray-500">
                  {clan?.clanCategory}
                </span>
                <span className="text-sm flex items-center">
                  <FaUserFriends className="mr-2" /> {clan?.memberCount}
                </span>
              </div>
            </div>
          </div>
          <div>
            <span className="text-lg flex items-center">
              {clan?.points}{" "}
              <FaTrophy
                className={
                  index === 0
                    ? "ml-2 text-yellow-500"
                    : index === 1
                    ? "ml-2 text-gray-400"
                    : index === 2
                    ? "ml-2 text-amber-600"
                    : "ml-2 text-gray-300 hidden"
                }
              />
            </span>
          </div>
        </li>
      </Link>
    ))}
  </main>
);

export default ClansLeaderBord;
