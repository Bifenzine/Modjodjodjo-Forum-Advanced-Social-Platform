import React, { useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { pageActiveContext } from "../ContextPageActive/ContextPageActive";
import useLogout from "../../Hooks/AuthHooks/useLogout";
import { useAuthContext } from "../../Context/AuthContext";
import { getAllCategories } from "../../DataFetching/DataFetching";
import getProfilePicUrl from "../../Utils/GetProfilePicUrl";
import truncateUsername from "../../Utils/Truncate";
import { useSocketContext } from "../../Context/SocketContext";
import OnlineStatus from "../../Utils/OnlineStatus";

// Import Material-UI icons and Tooltip
import {
  Home,
  SportsEsports,
  Code,
  SportsFootball,
  School,
  MusicNote,
  TagFaces,
  Theaters,
  Group,
  Logout,
  Login,
  Menu,
  ChevronLeft,
  Policy,
} from "@mui/icons-material";
import { Gavel } from "lucide-react";
import { Tooltip } from "@mui/material";
import { Gavel as GavelIcon } from "lucide-react";

// Helper function to map category names to icons
const CategoryIcon = ({ category }) => {
  switch (category.toLowerCase()) {
    case "anime":
      return <SportsEsports />;
    case "technology":
      return <Code />;
    case "sport":
      return <SportsFootball />;
    case "education":
      return <School />;
    case "music":
      return <MusicNote />;
    case "memes":
      return <TagFaces />;
    case "entertainment":
      return <Theaters />;
    case "politics":
      return <GavelIcon />;
    case "clans":
      return <Group />;
    default:
      return <Home />;
  }
};

const Navbar = ({ isOpen, toggleNavbar }) => {
  const { authUser } = useAuthContext();
  const { logout } = useLogout();
  const { setPageActive } = useContext(pageActiveContext);
  const [categories, setCategories] = React.useState([]);
  const location = useLocation();
  const { onlineUsers } = useSocketContext();

  const TriggerTheFeed = authUser ? "Feed" : "Home";

  useEffect(() => {
    getAllCategories()
      .then((data) => {
        setCategories(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    const path = location.pathname.split("/")[1];
    const category = categories.find(
      (cat) => cat.name.toLowerCase() === path.toLowerCase()
    );
    if (category) {
      setPageActive(category.name);
    } else {
      setPageActive(path || TriggerTheFeed);
    }
  }, [location.pathname, categories, setPageActive, TriggerTheFeed]);

  const navVariants = {
    open: { width: "180px", transition: { duration: 0.3 } },
    closed: { width: "80px", transition: { duration: 0.3 } },
  };

  const Navigate = useNavigate();

  return (
    <motion.nav
      className="fixed top-0 left-0 h-full bg-gradient-to-b from-surface-light via-surface to-surface-dark text-text overflow-x-hidden z-50 shadow-lg"
      variants={navVariants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}>
      <div className="p-4 relative">
        <button
          onClick={toggleNavbar}
          className="absolute top-4 px-7 -right-3 w-8 h-8 flex items-center justify-center bg-primary rounded-full hover:bg-primary-light transition-colors duration-200">
          {isOpen ? <ChevronLeft /> : <Menu />}
        </button>
        <div
          className="user-profile mb-8 flex flex-col items-center mt-12 cursor-pointer"
          onClick={() =>
            Navigate(authUser ? `/profile/${authUser?._id}/` : "/Register")
          }>
          <Tooltip title={authUser?.username} placement="right" arrow>
            <div className="relative mb-2">
              <img
                className="w-16 h-16 rounded-full object-cover border-2 border-primary-light shadow-lg"
                src={
                  authUser
                    ? getProfilePicUrl(authUser?.profilePic)
                    : "https://res.cloudinary.com/dp9d2rdk2/image/upload/v1729168009/wlmsv7nq0mwsii2rmdye.png"
                }
                alt="User Pic"
              />

              {OnlineStatus(authUser?._id, onlineUsers) && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-surface-dark"></div>
              )}
            </div>
          </Tooltip>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-semibold mt-2 bg-surface-light px-3 py-1 rounded-full">
                {truncateUsername(authUser ? authUser?.username : "Guest")}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <ul className="space-y-2">
          <Tooltip title={TriggerTheFeed} placement="right" arrow>
            <li>
              <NavItem
                to="/"
                icon={<Home />}
                label={TriggerTheFeed}
                isOpen={isOpen}
              />
            </li>
          </Tooltip>
          {categories.map((category, index) => (
            <Tooltip key={index} title={category.name} placement="right" arrow>
              <li>
                <NavItem
                  to={`/${category.name}/${category._id}`}
                  icon={<CategoryIcon category={category.name} />}
                  label={category.name}
                  isOpen={isOpen}
                />
              </li>
            </Tooltip>
          ))}
          <Tooltip title="Clans" placement="right" arrow>
            <li>
              <NavItem
                to="/Clans"
                icon={<Group />}
                label="Clans"
                isOpen={isOpen}
              />
            </li>
          </Tooltip>
          {authUser ? (
            <Tooltip title="Logout" placement="right" arrow>
              <li>
                <NavItem
                  to="/Logout"
                  icon={<Logout />}
                  label="Logout"
                  isOpen={isOpen}
                  onClick={logout}
                />
              </li>
            </Tooltip>
          ) : (
            <Tooltip title="Register" placement="right" arrow>
              <li>
                <NavItem
                  to="/Register"
                  icon={<Login />}
                  label="Register"
                  isOpen={isOpen}
                />
              </li>
            </Tooltip>
          )}
        </ul>
      </div>
    </motion.nav>
  );
};

const NavItem = ({ to, icon, label, isOpen, onClick }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to || location.pathname.startsWith(`/${label}/`);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center p-2 rounded-lg ${
        isActive ? "bg-primary" : "hover:bg-surface-light"
      } transition-colors duration-200`}>
      <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="ml-3">
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};

export default Navbar;
