import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../Context/AuthContext";
import config from "../../config/config";

const useEditClanPost = () => {
  const [error, setError] = useState(null);
  const [loadingClan, setloadingClan] = useState(false);

  const { authUser } = useAuthContext();

  const editClanPost = async (formData, postId) => {
    // console.log(formData.get("content"));

    if (!authUser) {
      toast.error("You need to be logged in to edit");
      return;
    }

    // const success = handleInputErrors(formData);

    // //if we didn't receive the data the function will stop
    // if (!success) {
    //   setloadingClan(false);
    //   return;
    // }

    try {
      setloadingClan(true);
      const response = await axios.patch(
        `${config.apiUrl}/clans/updatePost/${postId}`,
        formData,
        {
          withCredentials: true, // Send cookies with request
          headers: { "x-client-type": "web" },
        }
      );
      setloadingClan(false);
      toast.success("your Clan is edited !!!");
      return response.data;
    } catch (error) {
      setloadingClan(false);
      setError(error.response.data.error);
      toast.error("Clan not edited, try again");
      throw new Error(error.response.data.error); // Throw error to handle it in the component
    }
  };

  return { editClanPost, error, loadingClan };
};

export default useEditClanPost;

// function handleInputErrors(formData) {
//   //to check if the field are emplty so we remind the user to fill them all

//   // console.log(formData.get("content"), formData.get("photo"));

//   if (!formData.get("content") && !formData.get("photo")) {
//     //sending error message using toast library
//     toast.error("at least add a content or an image to create a comment");
//     return false;
//   }

//   return true;
// }
