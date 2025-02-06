import { useState } from "react";
import { toast } from "react-hot-toast";
import ForumApi from "../../DataFetching/DataFetching"; // Adjust the import if needed
import config from "../../config/config";

const useSignup = () => {
  const [loading, setLoading] = useState(false);

  const signup = async ({
    fullName,
    username,
    email,
    password,
    confirmPassword,
  }) => {
    const success = handleInputErrors({
      fullName,
      username,
      email,
      password,
      confirmPassword,
    });

    if (!success) {
      return;
    }

    setLoading(true);
    try {
      // const headers = { "x-client-type": "web" };
      const res = await ForumApi.post(
        "/api/auth/signup",
        {
          fullName,
          username,
          email,
          password,
          confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "web", // Include the client type header
          },
        }
      );
      // console.log("headers:", headers);

      const data = res.data;

      if (data.error) {
        if (data.unmetCriteria) {
          toast.error("Password does not meet the following criteria:");
          data.unmetCriteria.forEach((criterion) => toast.error(criterion));
        } else {
          throw new Error(data.error);
        }
      } else {
        toast.success(
          data.message ||
            "Sign up successful! Please check your email for verification."
        );
        console.log(data);
        return data; // Return user data for potential use in UI
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading };
};

export default useSignup;

function handleInputErrors({
  fullName,
  username,
  email,
  password,
  confirmPassword,
}) {
  if (!fullName || !username || !email || !password || !confirmPassword) {
    toast.error("Please fill in all fields");
    return false;
  }

  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return false;
  }

  const passwordCriteria = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const unmetCriteria = passwordCriteria.filter((criterion) => !criterion.met);

  if (unmetCriteria.length > 0) {
    toast.error("Password does not meet all criteria:");
    unmetCriteria.forEach((criterion) => toast.error(criterion.label));
    return false;
  }

  return true;
}
