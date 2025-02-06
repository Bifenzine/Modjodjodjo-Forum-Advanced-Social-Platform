import { useNavigate } from "react-router-dom";
import config from "../../config/config";

const useFacebook = () => {
  const navigate = useNavigate();

  const fbOauth = () => {
    window.location.href = `${config.apiUrl}/api/auth/facebook`;
  };

  return { fbOauth };
};

export default useFacebook;
