import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import ForumApi from "../../DataFetching/DataFetching"; // Adjust the import if needed

const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const login = async (username, password) => {
    const success = handleInputErrors(username, password);
    if (!success) {
      return;
    }

    setIsLoading(true);
    try {
      // Log the headers to see the client type
      const headers = { "x-client-type": "web" };
      console.log("Request Headers:", headers);
      const response = await ForumApi.post(
        "/api/auth/login",
        {
          username,
          password,
        },
        {
          headers,
          withCredentials: true, // Important: ensure cookies are sent with the request
        }
      );
      console.log("headers:", response.headers);

      const data = response.data;

      setAuthUser(data);
      toast.success(`Welcome back, ${data?.username}!`);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.error || "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, login };
};

export default useLogin;

function handleInputErrors(username, password) {
  if (!username || !password) {
    toast.error("Please fill in all fields");
    return false;
  }
  return true;
}
