import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useCreateClanPost = () => {
  const [error, setError] = useState(null);
  const [Loading, setLoading] = useState(false);

  const { authUser } = useAuthContext();

  const createClanPost = async (formData) => {
    // console.log(formData.get("content"));

    if (!authUser) {
      toast.error("You need to be logged in to create a Post in the Clan");
      return;
    }

    const success = handleInputErrors(formData, authUser);

    //if we didn't receive the data the function will stop
    if (!success) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${config.apiUrl}/clans/createPost`,
        formData,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setLoading(false);
      toast.success("Your post has been created !!!");
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response.data.error);
      toast.error("Failed to create post in the clan, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { createClanPost, error, Loading };
};

export default useCreateClanPost;

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
