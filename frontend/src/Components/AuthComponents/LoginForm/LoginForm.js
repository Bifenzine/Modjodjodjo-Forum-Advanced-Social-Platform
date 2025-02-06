import React, { useState } from "react";
import "../../../Pages/AuthRegis/authRegis.css";
import { FaFacebook, FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@material-tailwind/react";
import useGithub from "../../../Hooks/AuthHooks/useGithub";
import useGoogle from "../../../Hooks/AuthHooks/useGoogle";
import useFacebook from "../../../Hooks/AuthHooks/useFacebook";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";

const LoginForm = ({ onSubmit, changeLogStat, loading }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(username, password);
  };
  //

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

  return (
    <form
      className="form border-2 mt-8 mb-8 mx-auto bg-slate-900 border-slate-600"
      onSubmit={handleSubmit}>
      <p className="title">Log In</p>
      <p className="message">Log in now and get full access to our app.</p>
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
        <hr className="w-[15rem]" />
      </div>
      <label>
        <input
          required=""
          placeholder=""
          type="username"
          className="input bg-slate-900"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <span>Username</span>
      </label>
      <label className="relative">
        <input
          required=""
          placeholder=""
          type={showPassword ? "text" : "password"}
          className="input bg-slate-900"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span>Password</span>
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
          onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </label>
      <Link
        to={"/forgot-password"}
        className="forgot cursor-pointer text-sm text-blue-500 ">
        Forgot password ?
      </Link>
      <button className="submit" type="submit" disabled={loading}>
        {loading ? (
          <Loader className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          "Submit"
        )}
      </button>
      <p className="signin cursor-pointer">
        I don't have an account?{" "}
        <span className="text-blue-500" onClick={changeLogStat}>
          Sign up
        </span>
      </p>
    </form>
  );
};

export default LoginForm;
