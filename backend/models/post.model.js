import mongoose from "mongoose";

// Creating schema for the post using mongoose.schema
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    photo: {
      type: String,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    upVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    clan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clan",
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    reports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report"
    }],
  },
  { timestamps: true } // Adding timestamps for createdAt and updatedAt
);

// Define a virtual property to calculate the time difference
postSchema.virtual("timeSinceCreation").get(function () {
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
postSchema.set("toJSON", { virtuals: true });

// To create the schema in the MongoDB database
const Post = mongoose.model("Post", postSchema);

// Export the model
export default Post;
