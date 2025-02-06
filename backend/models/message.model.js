import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    clan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clan",
      required: false,
    },
    content: {
      type: String,
    },
    image: {
      type: String,
    },
    // add this for seen fetaure
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
