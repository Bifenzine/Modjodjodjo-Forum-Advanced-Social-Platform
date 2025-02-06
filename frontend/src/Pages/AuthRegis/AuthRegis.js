import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useSignup from "../../Hooks/AuthHooks/useSignup";
import useLogin from "../../Hooks/AuthHooks/useLogin";
import { LoginForm, RegistrationForm } from "../../Components";
import toast from "react-hot-toast";
import AlertDialog from "../../Components/CustomAlert/AlertDialog"; // Import the new component

const AuthRegis = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const { signup, loading } = useSignup();
  const { login, isLoading } = useLogin();
  const navigate = useNavigate();

  const emailo = "modjodjoforum@gmail.com";

  const changeLogStat = () => {
    setIsOpen((prevStat) => !prevStat);
  };

  const handleRegistrationSubmit = async (formData) => {
    try {
      const success = await signup(formData);
      if (success) {
        console.log(emailo);
        if (success?.email === emailo) {
          // toast.success("Registration successful. Please verify your email.");
          navigate("/verify-email");
        } else {
          setAlertTitle("Registration Successful");
          setAlertDescription("Please login now. Thank you.");
          setAlertOpen(true);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setAlertTitle("Registration Failed");
      setAlertDescription(
        error.message || "An error occurred during registration."
      );
      setAlertOpen(true);
    }
  };

  const handleLoginSubmit = async (username, password) => {
    try {
      await login(username, password);
    } catch (error) {
      console.error("Login error:", error);
      setAlertTitle("Login Failed");
      setAlertDescription(error.message || "An error occurred during login.");
      setAlertOpen(true);
    }
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    if (alertTitle === "Registration Successful") {
      navigate("/");
    }
  };

  return (
    <div className="flex justify-center items-center md:mt-8 mt-0 mb-4">
      {!isOpen ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}>
          <RegistrationForm
            changeLogStat={changeLogStat}
            onSubmit={handleRegistrationSubmit}
            loading={loading}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}>
          <LoginForm
            changeLogStat={changeLogStat}
            onSubmit={handleLoginSubmit}
            loading={isLoading}
          />
        </motion.div>
      )}
      <AlertDialog
        isOpen={alertOpen}
        onClose={handleAlertClose}
        title={alertTitle}
        description={alertDescription}
      />
    </div>
  );
};

export default AuthRegis;
