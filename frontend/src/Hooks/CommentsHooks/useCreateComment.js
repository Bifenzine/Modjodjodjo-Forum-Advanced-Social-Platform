import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useCreateComment = () => {
  const [error, setError] = useState(null);
  const [loadingComment, setLoadingComment] = useState(false);

  const { authUser } = useAuthContext();

  const createComment = async (formData, postId) => {
    // console.log(formData.get("content"));

    if (!authUser) {
      toast.error("You need to be logged in to comment");
      return;
    }

    const success = handleInputErrors(formData);

    //if we didn't receive the data the function will stop
    if (!success) {
      setLoadingComment(false);
      return;
    }

    try {
      setLoadingComment(true);
      const response = await axios.post(
        `${config.apiUrl}/comments/${postId}`,
        formData,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoadingComment(false);
      toast.success("Your comment is created !!!");
      return response.data;
    } catch (error) {
      setLoadingComment(false);
      setError(error.response.data.error);
      toast.error("Comment not Published, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { createComment, error, loadingComment };
};

export default useCreateComment;

function handleInputErrors(formData) {
  //to check if the field are emplty so we remind the user to fill them all

  // console.log(formData.get("content"), formData.get("photo"));

  if (!formData.get("content") && !formData.get("photo")) {
    //sending error message using toast library
    toast.error("at least add a content or an image to create a comment");
    return false;
  }

  return true;
}
