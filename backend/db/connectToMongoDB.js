import mongoose from "mongoose";
import config from "../config/config.js";

//connecting to mongodb using mongoose

const connectToMongoDB = async () => {
  try {
    // await mongoose.connect(process.env.MONGO_DB_URL);
    // the new link to connect with mongodb using link of the nodejs v2.2.12
    await mongoose.connect(config.mongoDbUri);
    console.log("connected to MongoDB");
  } catch (error) {
    console.log("error connecting to MongoDB", error.message);
  }
};

export default connectToMongoDB;
