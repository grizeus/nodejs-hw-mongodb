import { Request, Response } from "express";

import {
  loginUser,
  logoutUser,
  registerUser,
  refreshUsersSession,
  requestResetToken,
  resetPassword,
  verify,
  loginOrSignupWithGoogle,
} from "../services/auth.js";
import { generateAuthUrl } from "../utils/googleOAuth2.js";
import type { Session } from "../types/types.d.ts";

export const registerController = async (req: Request, res: Response) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: "Successfully registered a user",
    data: user,
  });
};

export const getGoogleOAuthUrlController = async (
  req: Request,
  res: Response,
) => {
  const url = generateAuthUrl();
  res.json({
    status: 200,
    message: "Successfully get Google OAuth url!",
    data: {
      url,
    },
  });
};

export const verifyController = async (req: Request, res: Response) => {
  const { verifyToken } = req.query;
  await verify(verifyToken as string);

  res.json({
    status: 200,
    message: "Successfully verified an email!",
  });
};

export const loginController = async (req: Request, res: Response) => {
  const { name, email, session } = await loginUser(req.body);

  res.cookie("refreshToken", session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie("sessionId", session._id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.json({
    status: 200,
    message: "Successfully logged in an user!",
    user: {
      name: name,
      email: email,
    },
    accesToken: session.accessToken,
  });
};

export const loginWithGoogleController = async (
  req: Request,
  res: Response,
) => {
  const session = await loginOrSignupWithGoogle(req.body.code);
  setupSession(res, session);

  res.json({
    status: 200,
    message: "Successfully logged in via Google OAuth!",
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutController = async (req: Request, res: Response) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie("sessionId");
  res.clearCookie("refreshToken");

  res.status(204).send();
};

const setupSession = (res: Response, session: Session) => {
  res.cookie("refreshToken", session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie("sessionId", session._id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });
};

export const refreshUserSessionController = async (
  req: Request,
  res: Response,
) => {
  const session: Session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });
  setupSession(res, session);

  res.json({
    status: 200,
    message: "Successfully refreshed a session!",
    accessToken: session.accessToken,
  });
};

export const requestResetEmailController = async (
  req: Request,
  res: Response,
) => {
  await requestResetToken(req.body.email);
  res.json({
    status: 200,
    message: "Reset password email was successfully sent!",
    data: {},
  });
};

export const resetPasswordController = async (req: Request, res: Response) => {
  await resetPassword(req.body);
  res.json({
    status: 200,
    message: "Password was successfully reset!",
    data: {},
  });
};
