import createHttpError from "http-errors";
import { UsersCollection } from "../db/models/user.js";

export const registerUser = async (payload) => {
  const { email } = payload;
  const user = await UsersCollection.findOne({ email });

  if (user) {
    throw createHttpError(409, "User already exist");
  }

  const newUser = await UsersCollection.create(payload);
  return newUser;
};
