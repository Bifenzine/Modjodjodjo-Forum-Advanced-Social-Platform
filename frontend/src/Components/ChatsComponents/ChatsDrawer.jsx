import React, { useState } from "react";
import { Drawer } from "@mui/material";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { FaUserFriends, FaUsers } from "react-icons/fa";
import ChatsForClans from "./ChatsForClans";
import ChatsForUser from "./ChatsForUser";
import ChatInterface from "./ChatInterface";
import ClanChatInterface from "./ClanChatInterface";
import "./ChatDrawer.css";
import { Button } from "@material-tailwind/react";
import { useAuthContext } from "../../Context/AuthContext";
import toast from "react-hot-toast";

const ChatsDrawer = ({ open, onClose }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleSelectUserChat = (chat) => {
    setSelectedChat({ ...chat, type: "user" });
  };

  const handleSelectClanChat = (chat) => {
    setSelectedChat({ ...chat, type: "clan" });
  };

  const handleBackToConversations = () => {
    setSelectedChat(null);
  };

  const { authUser } = useAuthContext();

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className="w-[20rem] bg-background-dark h-full text-white p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Chats</h2>
          <Button
            onClick={onClose}
            className="text-white border-2 border-primary">
            <FaTimes color="white" />
          </Button>
        </div>
        {selectedChat ? (
          selectedChat.type === "user" ? (
            <ChatInterface
              chat={selectedChat}
              onBack={handleBackToConversations}
            />
          ) : (
            <ClanChatInterface
              chat={selectedChat}
              onBack={handleBackToConversations}
            />
          )
        ) : (
          <TabGroup onChange={(index) => setActiveTab(index)}>
            <TabList className="flex space-x-1 border border-surface-light rounded-full justify-center items-center bg-gray-900 p-1">
              <Tab
                className={({ selected }) =>
                  selected
                    ? "bg-primary-dark w-full text-white px-3 py-2 rounded-full border border-slate-700"
                    : "bg-gray-900 w-full text-white px-3 py-2 rounded-full"
                }>
                <FaUserFriends className="inline mr-2" /> Friends
              </Tab>
              <Tab
                className={({ selected }) =>
                  selected
                    ? "bg-primary-dark w-full text-white px-3 py-2 rounded-full border border-slate-700"
                    : "bg-gray-900 w-full text-white px-3 py-2 rounded-full"
                }>
                <FaUsers className="inline mr-2" /> Clans
              </Tab>
            </TabList>

            <TabPanels className="mt-4 flex-1">
              <TabPanel className="overflow-y-auto h-full">
                <ChatsForUser onSelectChat={handleSelectUserChat} />
              </TabPanel>
              <TabPanel className="overflow-y-auto h-full">
                <ChatsForClans onSelectChat={handleSelectClanChat} />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        )}
      </div>
    </Drawer>
  );
};

export default ChatsDrawer;
