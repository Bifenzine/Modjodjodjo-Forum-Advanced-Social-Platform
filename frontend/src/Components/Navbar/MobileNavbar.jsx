import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Search, Menu, X, LogOut, LogIn } from "lucide-react";
import { pageActiveContext } from "../ContextPageActive/ContextPageActive";
import { useAuthContext } from "../../Context/AuthContext";
import { useSocketContext } from "../../Context/SocketContext";
import { getAllCategories } from "../../DataFetching/DataFetching";
import useLogout from "../../Hooks/AuthHooks/useLogout";
import getProfilePicUrl from "../../Utils/GetProfilePicUrl";
import truncateUsername from "../../Utils/Truncate";
import TuncateAltForImg from "../../Utils/TruncateAltForImg";
import OnlineStatus from "../../Utils/OnlineStatus";

const MobileNavbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser } = useAuthContext();
  const { logout } = useLogout();
  const { setPageActive } = useContext(pageActiveContext);
  const { onlineUsers } = useSocketContext();

  useEffect(() => {
    getAllCategories()
      .then((data) => {
        setCategories(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleNavigation = (path, label) => {
    setPageActive(label);
    navigate(path);
    setIsDrawerOpen(false);
  };

  const drawerVariants = {
    open: { y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: {
      y: "100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const AvatarNav = ({ ProfilePic, username, userId }) => (
    <div className="relative w-7 h-7">
      <img
        className="w-full h-full object-cover rounded-full border-2 border-slate-400 border-b-cyan-500"
        src={
          ProfilePic
            ? getProfilePicUrl(ProfilePic)
            : "https://res.cloudinary.com/dp9d2rdk2/image/upload/v1729168009/wlmsv7nq0mwsii2rmdye.png"
        }
        alt={TuncateAltForImg(username)}
      />
      {OnlineStatus(userId, onlineUsers) && (
        <>
          <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-slate-800"></div>
          <div className="absolute animate-pulse -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-slate-800"></div>
        </>
      )}
    </div>
  );

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 gradient-color border-t border-t-primary rounded-t-3xl gradient-color z-50">
        <ul className="flex justify-around items-center h-16">
          <li>
            <Link
              to="/"
              className={`flex flex-col items-center text-xs ${
                location.pathname === "/" ? "text-primary" : "text-gray-400"
              }`}>
              <Home size={26} />
              <span className="mt-1">Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/Search"
              className={`flex flex-col items-center text-xs ${
                location.pathname === "/Search"
                  ? "text-primary"
                  : "text-gray-400"
              }`}>
              <Search size={26} />
              <span className="mt-1">Search</span>
            </Link>
          </li>
          <li>
            <Link
              to={authUser ? `/profile/${authUser?._id}` : "/Register"}
              className={`flex flex-col items-center text-xs ${
                location.pathname === `/profile/${authUser?._id}`
                  ? "text-primary"
                  : "text-gray-400"
              }`}>
              <AvatarNav
                ProfilePic={authUser?.profilePic}
                username={authUser?.username}
                userId={authUser?._id}
              />
              <span className="mt-1">Profile</span>
            </Link>
          </li>
          <li>
            <button
              onClick={toggleDrawer}
              className="flex flex-col items-center text-xs text-gray-400">
              <Menu size={26} />
              <span className="mt-1">Menu</span>
            </button>
          </li>
        </ul>
      </nav>

      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            className="fixed inset-0 top-16 gradient-color border-t border-t-primary rounded-t-3xl z-50 overflow-y-auto"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={toggleDrawer}>
                  <X size={26} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto">
                <div className="p-4">
                  <ul className="space-y-4">
                    {categories.map((category) => (
                      <li key={category._id}>
                        <button
                          onClick={() =>
                            handleNavigation(
                              `/${category.name}/${category._id}`,
                              category.name
                            )
                          }
                          className={`w-full text-left py-2 ${
                            location.pathname.startsWith(`/${category.name}`)
                              ? "text-primary"
                              : "text-gray-400"
                          }`}>
                          {category.name}
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={() => handleNavigation("/Clans", "Clans")}
                        className={`w-full text-left py-2 ${
                          location.pathname === "/Clans"
                            ? "text-primary"
                            : "text-gray-400"
                        }`}>
                        Clans
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 border-t border-gray-800">
                {authUser ? (
                  <button
                    onClick={() => {
                      logout();
                      setIsDrawerOpen(false);
                    }}
                    className="flex items-center space-x-2 text-red-500">
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigation("/Register", "Register")}
                    className="flex items-center space-x-2 text-primary">
                    <LogIn size={20} />
                    <span>Register/Login</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavbar;
