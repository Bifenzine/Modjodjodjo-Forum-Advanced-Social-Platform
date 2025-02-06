import { useNavigate } from "react-router-dom";
import config from "../../config/config";

const useGithub = () => {
  const navigate = useNavigate();

  const API_URL = config.apiUrl;

  const githubOauth = () => {
    // Adding client type as a query parameter
    const clientType = "web"; // or "mobile" based on your logic
    window.location.href = `${API_URL}/api/auth/github?client_type=${clientType}`;
  };

  return { githubOauth };
};

export default useGithub;
