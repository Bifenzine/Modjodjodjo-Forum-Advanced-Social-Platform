import React, { useState } from "react";
import { SendIcon, X } from "lucide-react";
import toast from "react-hot-toast";
import useSendMessage from "../../Hooks/MessagesHooks/useSendMessage";

const CustomToast = ({ t, notification }) => {
  // const [message, setMessage] = useState("");
  // const { sendMessage } = useSendMessage();
  // console.log("message", message);
  // console.log("notification", notification);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const formData = new FormData();
  //   formData.append("content", message);
  //   // console.log("Content:", formData.get("content"));
  //   try {
  //     await sendMessage(formData, notification?.sender?._id);
  //     setMessage("");
  //   } catch (error) {
  //     console.error("Failed to send message:", error);
  //   }
  // };

  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-102`}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <img
              className="h-10 w-10 rounded-full object-cover border-2 border-blue-500"
              src={notification?.sender?.profilePic || "/default-avatar.png"}
              alt=""
            />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-blue-400">
              {/* {notification.sender?.username}  */}
              {notification?.content}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {notification?.notifContenu}
            </p>
            {/* <div className="mt-2 flex gap-2 relative items-center justify-center ">
              <input
                type="text"
                value={message}
                placeholder="reply instantly..."
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full py-2 px-4 
                border border-background rounded-md outline-none text-sm
                bg-background-dark"
              />
              <SendIcon
                className="cursor-pointer hover:text-blue-500"
                size={28}
                onClick={handleSubmit}
              />
            </div> */}
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toast.dismiss()}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default CustomToast;
