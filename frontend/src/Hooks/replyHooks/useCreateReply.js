import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useCreateReply = () => {
  const [error, setError] = useState(null);
  const [loadingReply, setloadingReply] = useState(false);
  const { authUser } = useAuthContext();

  const createReply = async (formData, commentId) => {
    // console.log(formData.get("content"));

    if (!authUser) {
      toast.error("You need to be logged in to Reply to a comment");
      return;
    }
    const success = handleInputErrors(formData);

    //if we didn't receive the data the function will stop
    if (!success) {
      setloadingReply(false);
      return;
    }

    try {
      setloadingReply(true);
      const response = await axios.post(
        `${config.apiUrl}/replies/addReply/${commentId}`,
        formData,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setloadingReply(false);
      toast.success("Your reply is created !!!");
      return response.data;
    } catch (error) {
      setloadingReply(false);
      setError(error.response.data.error);
      toast.error("Reply not Published, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { createReply, error, loadingReply };
};

export default useCreateReply;

function handleInputErrors(formData) {
  //to check if the field are emplty so we remind the user to fill them all

  // console.log(formData.get("content"), formData.get("photo"));

  if (!formData.get("content") && !formData.get("photo")) {
    //sending error message using toast library
    toast.error("at least add a content or an image to create a reply");
    return false;
  }

  return true;
}
