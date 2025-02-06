import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaPaperPlane, FaChevronLeft, FaQuestionCircle } from "react-icons/fa";
import { useAuthContext } from "../../Context/AuthContext";
import Loader from "./Loader";
import config from "../../config/config";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { authUser } = useAuthContext();

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };
  const helpMessage = `How can I assist you today? I can help with:
1. Creating posts
2. Finding content
3. Joining clans
4. Using the messaging system
5. Navigating the website
6. Explaining features

Feel free to ask about any of these or anything else related to our website!`;

  const handleHelp = () => {
    setMessages((prev) => [...prev, { sender: "bot", text: helpMessage }]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() === "" || isLoading) return;

    setIsLoading(true);
    const newMessages = [...messages, { sender: "user", text: message }];
    setMessages(newMessages);
    setMessage("");

    try {
      const res = await axios.post(`${config.apiUrl}/chatbot/ask`, {
        messages: newMessages,
      });
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.data.response },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "There was an error processing your request." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed md:bottom-4 md:right-4 z-50 bottom-20 right-4">
      {isOpen ? (
        <div className="bg-background-dark  md:w[30vw] w-[80vw] h-[60vh] shadow-xl rounded-2xl flex flex-col text-white overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between p-4 bg-surface-dark rounded-t-2xl">
            <button onClick={toggleChatbot}>
              <FaChevronLeft className="text-xl" />
            </button>
            <h2 className="text-lg font-bold">MODJO AI Assistant</h2>
            <button onClick={handleHelp}>
              <FaQuestionCircle className="text-xl" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex flex-col items-start space-y-4">
              <div className="bg-background-dark border border-primary p-3 rounded-md text-left w-full">
                <p>Hi there! , {helpMessage} </p>
              </div>

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${
                    msg.sender === "bot"
                      ? "bg-background-dark border border-primary"
                      : "bg-primary-dark"
                  } p-3 rounded-md text-left w-full`}>
                  <p>{msg.text}</p>
                </div>
              ))}
              {isLoading && (
                <div className="bg-gray-800 p-3 flex justify-center items-center rounded-md text-center w-full">
                  <p>
                    <Loader />
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <form
            onSubmit={handleFormSubmit}
            className="flex items-center p-4 bg-background border-t border-primary">
            <input
              type="text"
              placeholder="Ask me anything about the website..."
              value={message}
              onChange={handleInputChange}
              className="flex-1 p-2 rounded-md bg-background-light text-white focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="ml-2 bg-primary p-2 rounded-full hover:bg-primary-light transition-colors"
              disabled={isLoading}>
              <FaPaperPlane className="text-white text-xl" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={toggleChatbot}
          className="bg-primary relative text-white p-4 
                    rounded-full shadow-lg hover:border-2 hover:border-primary-dark 
                    focus:outline-none w-14 transition-colors">
          <img
            src="https://res.cloudinary.com/dp9d2rdk2/image/upload/v1728913770/aichat_o7xmc4.png"
            alt="AI Chatbot"
            className="absolute bottom-0 right-0 left-0 "
          />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
