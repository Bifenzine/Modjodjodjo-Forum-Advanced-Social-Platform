import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useCreateClan = () => {
  const [error, setError] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastStatus, setToastStatus] = useState("idle");

  const { authUser } = useAuthContext();

  const createClan = async (formData) => {
    // console.log(formData.get("content"));

    if (!authUser) {
      toast.error("You need to be logged in to create a Clan");
      return;
    }

    const success = handleInputErrors(formData, authUser);

    //if we didn't receive the data the function will stop
    if (!success) {
      setLoading(false);
      return;
    }
    let progressInterval;

    try {
      setLoading(true);
      setProgress(0);
      setToastStatus("processing");

      progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);
      const response = await axios.post(
        `${config.apiUrl}/clans/create`,
        formData,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      clearInterval(progressInterval);
      setProgress(100);
      setToastStatus("success");
      setLoading(false);
      toast.success("Your clan has been created !!!");
      setTimeout(() => {
        setToastStatus("idle");
        setProgress(0);
      }, 2000);
      return response.data;
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setToastStatus("error");
      setLoading(false);
      setProgress(0);

      setTimeout(() => {
        setToastStatus("idle");
      }, 2000);
      setError(error.response.data.error);
      toast.error("Failed to create clan, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { createClan, error, Loading, progress, toastStatus, setToastStatus };
};

export default useCreateClan;

function handleInputErrors(formData, authUser) {
  //to check if the field are emplty so we remind the user to fill them all

  // console.log(formData.get("content"), formData.get("photo"));

  if (!formData.get("name") || !formData.get("description")) {
    //sending error message using toast library
    toast.error("Please fill both the name and the description of the clan");
    return false;
  }

  return true;
}
