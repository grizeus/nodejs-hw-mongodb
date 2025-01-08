import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import path from "node:path";
import { readFile } from "node:fs/promises";
import handlebars from "handlebars";
import { Types } from "mongoose";

import { getEnvVar } from "../utils/getEnvVar.js";
import { sendEmail } from "../utils/sendMail.js";
import { UsersCollection } from "../db/models/user.js";
import { SessionCollection } from "../db/models/session.js";
import {
  refreshTokenLifetime,
  accessTokenLifetime,
  SMTP,
  TEMPALTES_DIR,
} from "../constants/index.js";
import type { AuthPayload } from "../types/types.d.ts";

export const registerUser = async (payload: AuthPayload) => {
  const { email, password } = payload;
  const user = await UsersCollection.findOne({ email });

  if (user) {
    throw createHttpError(409, "Email in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UsersCollection.create({
    ...payload,
    password: hashedPassword,
  });
  return newUser;
};

export const loginUser = async (payload: AuthPayload) => {
  const { email, password } = payload;
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(401, "Email or password invalid");
  }

  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    throw createHttpError(401, "Email or password invalid");
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString("base64");
  const refreshToken = randomBytes(30).toString("base64");

  return SessionCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: Date.now() + accessTokenLifetime,
    refreshTokenValidUntil: Date.now() + refreshTokenLifetime,
  });
};

export const logoutUser = async (sessionId: Types.ObjectId) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};

const createSession = () => {
  const accessToken = randomBytes(30).toString("base64");
  const refreshToken = randomBytes(30).toString("base64");

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: Date.now() + accessTokenLifetime,
    refreshTokenValidUntil: Date.now() + refreshTokenLifetime,
  };
};

export const refreshUsersSession = async ({
  sessionId,
  refreshToken,
}: {
  sessionId: Types.ObjectId;
  refreshToken: string;
}) => {
  const oldSession = await SessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!oldSession) {
    throw createHttpError(401, "Session not found");
  }

  const isSessionTokenExpired =
    new Date() > new Date(oldSession.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, "Session token expired");
  }

  const newSession = createSession();

  await SessionCollection.deleteOne({
    _id: sessionId,
    refreshToken,
  });

  return await SessionCollection.create({
    userId: oldSession.userId,
    ...newSession,
  });
};

export const getSession = (filter: { accessToken: string }) =>
  SessionCollection.findOne(filter);
export const getUser = (filter: { _id?: Types.ObjectId; email?: string }) =>
  UsersCollection.findOne(filter);

export const requestResetToken = async (email: string) => {
  const user = await getUser({ email });

  if (!user) {
    throw createHttpError(404, "User not found");
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar("JWT_SECRET"),
    {
      expiresIn: "15m",
    },
  );

  const resetPassTemplatePath = path.join(
    TEMPALTES_DIR,
    "reset-password-email.html",
  );

  const templateSource = await readFile(resetPassTemplatePath, "utf-8");
  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${getEnvVar("APP_DOMAIN")}/auth/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: "Reset your password",
    html,
  });
};

export const resetPassword = async (payload: {
  token: string;
  password: string;
}) => {
  let entries: any;

  try {
    entries = jwt.verify(payload.token, getEnvVar("JWT_SECRET"));
  } catch (err) {
    if (err instanceof Error) {
      throw createHttpError(401, err.message);
    }
    throw err;
  }

  const user = await getUser({ email: entries.email, _id: entries.sub });
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
};
