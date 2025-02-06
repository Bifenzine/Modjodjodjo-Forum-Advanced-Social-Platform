import mongoose from "mongoose";

// Creating schema for the bookmark using mongoose.schema
const bookmarkSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bookmarkedPosts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
    },
    { timestamps: true } // Adding timestamps for createdAt and updatedAt
);

// To include virtual properties in JSON output, set 'toJSON' options
bookmarkSchema.set("toJSON", { virtuals: true });

// To create the schema in the MongoDB database
const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

// Export the model
export default Bookmark;