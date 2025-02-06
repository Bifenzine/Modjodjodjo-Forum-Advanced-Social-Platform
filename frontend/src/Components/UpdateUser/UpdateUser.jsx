import React, { useState, useRef } from "react";
import "../../Pages/AuthRegis/authRegis.css";
import { MdModeEdit } from "react-icons/md";
import Tooltip from "@mui/material/Tooltip";
import useUpdateUser from "../../Hooks/UserHooks/useUpdateUser";
import CheckBoxGender from "../AuthComponents/CheckBoxGender/CheckBoxGender";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";

const UpdateUser = ({
  changeLogStat,
  username,
  profilePic,
  bio,
  email,
  password,
  fullname,
  gender,
  onUpdate,
}) => {
  const [inputs, setInputs] = useState({
    fullName: fullname,
    username: username,
    email: email,
    // password: password,
    // confirmPassword: '',
    // gender: gender,
    profilePic: profilePic,
  });

  console.log(inputs);

  const { error, loading, updateUserProfile } = useUpdateUser(); // Use the update user hook

  const [imagePreview, setImagePreview] = useState(null); // State to hold the image preview URL

  const fileInputRef = useRef(null); // Create a ref for file input

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    setInputs({ ...inputs, profilePic: file }); // Update profilePic in inputs state

    // Preview the selected image
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
  };

  const handleEditIconClick = () => {
    fileInputRef.current.click(); // Trigger click event on file input
  };

  // const handleCheckBoxGender = (gender) => {
  //     setInputs({ ...inputs, gender });
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", inputs.fullName);
    formData.append("username", inputs.username);
    formData.append("email", inputs.email);
    // formData.append("password", inputs.password);
    // formData.append("confirmPassword", inputs.confirmPassword);
    formData.append("gender", inputs.gender);
    if (inputs.profilePic) {
      formData.append("profilePic", inputs.profilePic);
    }

    console.log("fullName:", formData.get("fullName"));
    console.log("username:", formData.get("username"));
    console.log("email:", formData.get("email"));
    // console.log("password:", formData.get("password"));
    // console.log("confirmPassword:", formData.get("confirmPassword"));
    // console.log("gender:", formData.get("gender"));
    console.log("profilePic:", formData.get("profilePic"));

    console.log(formData);

    try {
      const updateUser = await updateUserProfile(formData);
      console.log("Updated user Data:", updateUser);

      changeLogStat();
      // Update the post detail state or handle any other necessary logic
    } catch (error) {
      console.error("Error updating user:", error);

      // Handle error
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-background bg-opacity-50 flex justify-center items-center z-50">
      <form
        className="form border-2 mt-4 mb-8 bg-slate-900 border-primary"
        onSubmit={handleSubmit}
        encType="multipart/form-data">
        <p className="title">Update Profile</p>
        <div className="grid justify-center items-center">
          <span className="relative ">
            <Tooltip title={"edit your profile image"}>
              <span
                className="absolute cursor-pointer right-0 bottom-0 px-1 py-1 bg-slate-900 rounded-full border border-slate-500"
                onClick={handleEditIconClick}>
                <MdModeEdit className="" />
              </span>
            </Tooltip>

            {imagePreview ? (
              <img
                className="w-[5rem] h-[5rem] object-cover rounded-full border-2 border-primary"
                src={imagePreview}
                alt="Profile Preview"
              />
            ) : (
              <img
                className="w-[5rem] object-cover h-[5rem] rounded-full border-2 border-primary"
                src={inputs.profilePic}
                alt="Profile Picture"
              />
            )}
          </span>
          <input
            type="file"
            id="profilePic"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <div className="flexo">
          <label>
            <input
              required=""
              placeholder=""
              type="text"
              className="input bg-slate-900"
              value={inputs.fullName}
              onChange={(e) =>
                setInputs({ ...inputs, fullName: e.target.value })
              }
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
              onChange={(e) =>
                setInputs({ ...inputs, username: e.target.value })
              }
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
        <Link
          to="/forgot-password"
          className="px-2 cursor-pointer text-primary-light ">
          reset your password
        </Link>

        {/* <label>
                    <input required="" placeholder="" type="password" className="input bg-slate-900"
                        value={inputs.password}
                        onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                    />
                    <span>New password</span>
                </label> */}

        {/* <label>
                    <input required="" placeholder="" type="password" className="input bg-slate-900"
                        value={inputs.confirmPassword}
                        onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
                    />
                    <span>Confirm new password</span>
                </label> */}
        {/* masked the gender box and the function related to it */}
        {/* <CheckBoxGender onCheckBoxChange={handleCheckBoxGender} selectedGender={inputs.gender} /> */}
        <div className="flex justify-evenly items-center w-full gap-4">
          <button className="submit w-4/6" type="submit" disabled={loading}>
            {loading ? (
              <Loader className="animate-spin w-5 h-5 mx-auto" />
            ) : (
              "Update"
            )}
          </button>
          <button
            onClick={changeLogStat}
            className="bg-background-dark border border-primary px-2 py-2 rounded-md hover:bg-slate-950">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUser;
