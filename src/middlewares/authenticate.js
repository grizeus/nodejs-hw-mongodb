import createHttpError from "http-errors";

import { SessionCollection } from "../db/models/session.js";
import { UsersCollection } from "../db/models/user.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.get("Autorization");
};
