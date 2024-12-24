import { UsersCollection } from "../db/models/user.js";

export const registerUser = async (payload) => {
  const newUser = await UsersCollection.create(payload);
  return newUser;
};
