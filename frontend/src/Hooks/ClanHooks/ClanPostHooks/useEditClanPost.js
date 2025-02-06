import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../../Context/AuthContext";
import config from "../../../config/config";

const useEditClanPost = () => {
  const [error, setError] = useState(null);
  const [loadingClan, setloadingClan] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastStatus, setToastStatus] = useState("idle");

  const { authUser } = useAuthContext();

  const editClanPost = async (postId, formData) => {
    // console.log(formData.get("content"));

    if (!authUser) {
      toast.error("You need to be logged in to edit");
      return;
    }

    const success = handleInputErrors(formData);

    //if we didn't receive the data the function will stop
    if (!success) {
      setloadingClan(false);
      return;
    }

    let progressInterval;

    try {
      setloadingClan(true);
      setProgress(0);
      setToastStatus("processing");

      progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);
      const response = await axios.patch(
        `${config.apiUrl}/clans/updatePost/${postId}`,
        formData,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      clearInterval(progressInterval);
      setProgress(100);
      setToastStatus("success");
      setloadingClan(false);
      toast.success("your Clan is edited !!!");
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
      setloadingClan(false);
      setProgress(0);

      setTimeout(() => {
        setToastStatus("idle");
      }, 2000);
      setError(error.response.data.error);
      toast.error("Clan not edited, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return {
    editClanPost,
    error,
    loadingClan,
    progress,
    toastStatus,
    setToastStatus,
  };
};

export default useEditClanPost;

function handleInputErrors(formData) {
  //to check if the field are emplty so we remind the user to fill them all

  // console.log(formData.get("content"), formData.get("photo"));

  if (!formData.get("title") && !formData.get("content")) {
    //sending error message using toast library
    toast.error("add the title and the content to edit the post");
    return false;
  }

  return true;
}
