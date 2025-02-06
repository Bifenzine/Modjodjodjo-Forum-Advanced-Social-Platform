import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      default: "",
      unique: true,
    },
    password: {
      type: String,
      minlength: 6,
      default: "",
    },
    // gender: {
    //   type: String,
    //   enum: ["male", "female"],
    // },
    profilePic: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // popularity next feature
    clan: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clan",
      },
    ],
    googleId: { type: String },
    githubId: { type: String },
    bookmark: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bookmark",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    // for clerk auth mobile version
    // clerkId: { type: String, unique: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
