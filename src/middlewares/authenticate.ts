import createHttpError from "http-errors";
import { Response, NextFunction } from "express";

import { getSession, getUser } from "../services/auth.js";
import { ExpandedRequest } from "../types/types.js";

export const authenticate = async (
  req: ExpandedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    next(createHttpError(401, "Please provide Authorization header"));
    return;
  }

  const [bearer, accessToken] = authHeader.split(" ");
  if (bearer !== "Bearer" || !accessToken) {
    next(createHttpError(401, "Auth header should of type Bearer"));
    return;
  }

  const session = await getSession({ accessToken });
  if (!session) {
    next(createHttpError(401, "Session not found"));
    return;
  }

  const isAccessTokenExpired =
    new Date() > new Date(session.accessTokenValidUntil);
  if (isAccessTokenExpired) {
    next(createHttpError(401, "Access token expired"));
    return;
  }

  const user = await getUser({ _id: session.userId });
  if (!user) {
    next(createHttpError(401, "User not found"));
    return;
  }

  req.user = user;

  next();
};
