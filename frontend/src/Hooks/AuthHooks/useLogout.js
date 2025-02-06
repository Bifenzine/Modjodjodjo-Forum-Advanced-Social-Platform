import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import ForumApi from "../../DataFetching/DataFetching"; // Adjust the import if needed

const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const alertConfirmation = () => {
    return window.confirm("Are you sure you want to logout?");
  };

  const logout = async () => {
    if (!alertConfirmation()) {
      toast("Your action has been cancelled", {
        duration: 3000,
      });
      return; // If user cancels, stop the function
    }

    setLoading(true);
    try {
      // Send a POST request to the logout endpoint with the x-client-type header
      const response = await ForumApi.post(
        "/api/auth/logout",
        {}, // No body needed for logout
        {
          headers: { "x-client-type": "web" }, // Include the client type header
          withCredentials: true, // Ensure cookies are sent with the request
        }
      );

      const data = response.data;

      // Check for any errors in the response
      if (data.error) {
        throw new Error(data.error);
      }

      // Clear local storage and context
      localStorage.removeItem("forum-user");
      setAuthUser(null);
      toast.success("You are logged out successfully");
    } catch (error) {
      console.log("Logout error:", error.message);
      toast.error("There might be a problem, please wait...");
    } finally {
      setLoading(false);
    }
  };

  return { loading, logout };
};

export default useLogout;
