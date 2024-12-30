import mongoose from "mongoose";

import  getEnv  from "../utils/getEnvVar.js";

export const initMongoConnection = async () => {
  try {
    const url = getEnv("MONGODB_URL");
    const db = getEnv("MONGODB_DB");
    const user = getEnv("MONGODB_USER");
    const pwd = getEnv("MONGODB_PASSWORD");
    await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority&appName=Cluster0`,
    );
    console.log("Mongo connection successfully established!");
  } catch (e) {
    console.log("Error while setting up mongo connection", e);
    throw e;
  }
};
