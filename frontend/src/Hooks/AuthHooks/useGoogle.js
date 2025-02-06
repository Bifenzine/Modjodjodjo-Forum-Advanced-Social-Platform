import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useGoogle = () => {
  const { setAuthUser } = useAuthContext();
  const navigate = useNavigate();

  const API_URL = config.apiUrl;

  const googleOauth = () => {
    // Adding client type as a query parameter
    const clientType = "web"; // or "mobile" based on your logic
    window.location.href = `${API_URL}/api/auth/google?client_type=${clientType}`;
  };

  return { googleOauth };
};

export default useGoogle;
