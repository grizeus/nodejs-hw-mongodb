import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
export const initMongoConnection = async () => {
  try {
    const url = process.env.MONGODB_URL;
    const db = process.env.MONGODB_DB;
    const user = process.env.MONGODB_USER;
    const pwd = process.env.MONGODB_PASSWORD;
    await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/?retryWrites=true&w=majority`,
    );
    console.log("Mongo connection successfully established!");
  } catch (e) {
    console.log("Error while setting up mongo connection", e);
    throw e;
  }
};
