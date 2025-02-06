import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "../Context/AuthContext";
import toast from "react-hot-toast";
import AuthLoader from "../Components/Loader/AuthLoader/AuthLoader";
import config from "../config/config";
const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/auth/userData`, {
          withCredentials: true,
          credentials: "include",
          headers: { "x-client-type": "web" },
        });
        if (response.data) {
          setAuthUser(response.data);
          console.log(response.data);
          localStorage.setItem("forum-user", JSON.stringify(response.data));
          // toast.success("Logged in successfully");
          navigate("/");
        } else {
          throw new Error("No user data received");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // toast.error("Login failed. Please try again.");
        navigate("/");
      }
    };
    fetchUserData();
  }, [navigate, setAuthUser]);

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <AuthLoader />
    </div>
  );
};

export default OAuthCallback;
