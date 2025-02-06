import React, { useState } from "react";
import "../../../Pages/AuthRegis/authRegis.css";
import { FaFacebook, FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@material-tailwind/react";
import useGoogle from "../../../Hooks/AuthHooks/useGoogle";
import useGithub from "../../../Hooks/AuthHooks/useGithub";
import useFacebook from "../../../Hooks/AuthHooks/useFacebook";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegistrationForm = ({ onSubmit, changeLogStat, loading }) => {
  const [inputs, setInputs] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(inputs);
  };

  const { googleOauth } = useGoogle();
  const { githubOauth } = useGithub();
  const { fbOauth } = useFacebook();

  const handleGoogleOauth = async () => {
    try {
      await googleOauth();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGithubOauth = async () => {
    try {
      await githubOauth();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFbOauth = async () => {
    try {
      await fbOauth();
    } catch (err) {
      console.error(err);
    }
  };

  const navigate = useNavigate();

  return (
    <form
      className="form border-2 mt-4 mb-8 bg-slate-900 border-slate-600"
      onSubmit={handleSubmit}>
      <p className="title">Register</p>
      <p className="message">Sign up now and get full access to our app.</p>
      <div className="flex px-4 py-2 w-full justify-center items-center space-x-4">
        <Button
          onClick={handleGithubOauth}
          className="border border-slate-600 flex justify-center items-center p-2 w-[10rem]">
          <FaGithub size={30} />
        </Button>
        <Button
          onClick={handleGoogleOauth}
          className="border border-slate-600 flex justify-center items-center p-2 w-[10rem]">
          <FcGoogle size={30} />
        </Button>
        <Button
          onClick={handleFbOauth}
          className="border border-slate-600 flex justify-center items-center p-2 w-[10rem]"
          disabled>
          <FaFacebook size={30} />
        </Button>
      </div>
      <div className="flex justify-center items-center py-1">
        <hr className="w-[15rem] "></hr>
      </div>
      <div className="flexo">
        <label>
          <input
            required=""
            placeholder=""
            type="text"
            className="input bg-slate-900"
            value={inputs.fullName}
            onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
          />
          <span>Full name</span>
        </label>
        <label>
          <input
            required=""
            placeholder=""
            type="text"
            className="input bg-slate-900"
            value={inputs.username}
            onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
          />
          <span>Username</span>
        </label>
      </div>
      <label>
        <input
          required=""
          placeholder=""
          type="email"
          className="input bg-slate-900"
          value={inputs.email}
          onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
        />
        <span>Email</span>
      </label>
      <label className="relative">
        <input
          required=""
          placeholder=""
          type={showPassword ? "text" : "password"}
          className="input bg-slate-900"
          value={inputs.password}
          onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
        />
        <span>Password</span>
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
          onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </label>
      <label className="relative">
        <input
          required=""
          placeholder=""
          type={showConfirmPassword ? "text" : "password"}
          className="input bg-slate-900"
          value={inputs.confirmPassword}
          onChange={(e) =>
            setInputs({ ...inputs, confirmPassword: e.target.value })
          }
        />
        <span>Confirm password</span>
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </label>

      <PasswordStrengthMeter password={inputs.password} />

      <button className="submit" type="submit" disabled={loading}>
        {loading ? (
          <Loader className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          "Submit"
        )}
      </button>
      <p className="signin cursor-pointer">
        Already have an account?{" "}
        <span className="text-blue-500" onClick={changeLogStat}>
          Log in
        </span>{" "}
      </p>
    </form>
  );
};

export default RegistrationForm;
