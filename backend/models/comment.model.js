import mongoose from "mongoose";

// Creating schema for the comment using mongoose.schema
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
    },
    photo: {
      type: String,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reply", // Specify the model name here
      },
    ],
  },
  { timestamps: true }
);

// Define a virtual property to calculate the time difference
commentSchema.virtual("timeSinceCreation").get(function () {
  const currentTime = new Date();
  const createdAtTime = this.createdAt;
  const timeDifference = currentTime - createdAtTime;

  // Convert milliseconds to seconds
  const secondsDifference = Math.floor(timeDifference / 1000);

  // Convert seconds to minutes
  const minutesDifference = Math.floor(secondsDifference / 60);

  // Convert minutes to hours
  const hoursDifference = Math.floor(minutesDifference / 60);

  // Convert hours to days
  const daysDifference = Math.floor(hoursDifference / 24);

  if (daysDifference > 0) {
    return `${daysDifference} days ago`;
  } else if (hoursDifference > 0) {
    return `${hoursDifference} hours ago`;
  } else if (minutesDifference > 0) {
    return `${minutesDifference} minutes ago`;
  } else {
    return `${secondsDifference} seconds ago`;
  }
});

// To include virtual properties in JSON output, set 'toJSON' options
commentSchema.set("toJSON", { virtuals: true });

// To create the schema in the MongoDB database
const Comment = mongoose.model("Comment", commentSchema);

// Export the model
export default Comment;
