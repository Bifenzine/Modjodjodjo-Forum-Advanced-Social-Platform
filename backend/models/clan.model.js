import mongoose from "mongoose";

const clanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    messages: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
    ],
    bannerImage: {
      type: String,
      default: "",
    },
    clanCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Clan = mongoose.model("Clan", clanSchema);
export default Clan;
