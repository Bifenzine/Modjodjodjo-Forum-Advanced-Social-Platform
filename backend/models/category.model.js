import mongoose from 'mongoose';

//creating schema for the user using mongoose.schema

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: String,


    },
    // timesstamps will provide us with the object containing the date of : created at and updated at
    //createdAt,updateAt => message.createdAt : 15:30 ....
    { timestamps: true }
);

//to create the schema in the mongodb database
const Category = mongoose.model("Category", categorySchema);

//we export it so we are able to use this schema in other methods
export default Category;

