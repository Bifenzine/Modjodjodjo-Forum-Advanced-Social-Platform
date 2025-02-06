import { useState } from "react";
import axios from "axios";
import config from "../../config/config";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import notif from "../../assets/sounds/alert.mp3";

const API_URL = config.apiUrl;

axios.defaults.withCredentials = true;

export const useVerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const alertSound = () => {
    const audio = new Audio(notif);
    audio.play();
  };

  const verifyEmail = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/verify-email`,
        { code },
        // add the headers to the request for web
        {
          headers: { "x-client-type": "web" }, // Add client type header
        }
      );

      setLoading(false);
      // console.log(response.data.user);

      alertSound();
      toast.success(
        "Email verified successfully ,Now login to be part of the family"
      );
      return;
    } catch (error) {
      setError(error.response?.data?.message || "Error verifying email");
      setLoading(false);
      throw error;
    }
  };

  return { verifyEmail, loading, error };
};

export const useCheckAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/auth/check-auth`);
      setLoading(false);
      return response.data.user;
    } catch (error) {
      setError(null);
      setLoading(false);
      return null;
    }
  };

  return { checkAuth, loading, error };
};

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email,
      });
      setMessage(response.data.message);
      setLoading(false);
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      setError(
        error.response?.data?.message || "Error sending reset password email"
      );
      setLoading(false);
      throw error;
    }
  };

  return { forgotPassword, loading, error, message };
};

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    matching: false,
  });
  const [isValid, setIsValid] = useState(false);

  const validatePasswordCriteria = (password, confirmPassword) => {
    const criteria = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      matching: password === confirmPassword && password !== "",
    };

    setPasswordCriteria(criteria);
    const allCriteriaMet = Object.values(criteria).every(Boolean);
    setIsValid(allCriteriaMet);
    return allCriteriaMet;
  };

  const getCriteriaStatus = () => [
    { label: "At least 6 characters", met: passwordCriteria.length },
    { label: "Contains uppercase letter", met: passwordCriteria.uppercase },
    { label: "Contains lowercase letter", met: passwordCriteria.lowercase },
    { label: "Contains a number", met: passwordCriteria.number },
    { label: "Contains special character", met: passwordCriteria.special },
    { label: "Passwords match", met: passwordCriteria.matching },
  ];

  const checkPassword = (password, confirmPassword) => {
    validatePasswordCriteria(password, confirmPassword);
  };

  const resetPassword = async (token, password, confirmPassword) => {
    // Validate password before proceeding
    if (!validatePasswordCriteria(password, confirmPassword)) {
      const unmetCriteria = getCriteriaStatus()
        .filter((criterion) => !criterion.met)
        .map((criterion) => criterion.label);

      toast.error("Please meet all password criteria:");
      unmetCriteria.forEach((criterion) => toast.error(criterion));
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/reset-password/${token}`,
        {
          password,
        }
      );
      setMessage(response.data.message);
      toast.success("Password reset successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error resetting password";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    resetPassword,
    loading,
    error,
    message,
    checkPassword,
    passwordCriteria,
    isValid,
    getCriteriaStatus,
  };
};
