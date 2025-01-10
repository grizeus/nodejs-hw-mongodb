import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import path from "node:path";
import { readFile } from "node:fs/promises";
import handlebars from "handlebars";

import getEnv from "../utils/getEnvVar.js";
import { sendEmail } from "../utils/sendMail.js";
import { UsersCollection } from "../db/models/user.js";
import { SessionCollection } from "../db/models/session.js";
import {
  refreshTokenLifetime,
  accessTokenLifetime,
  TEMPALTES_DIR,
} from "../constants/index.js";

const VERIFICATION = getEnv("ENABLE_VERIFICATION") === "true";
const verifyEmailTemplatePath = path.join(TEMPALTES_DIR, "verify-email.html");
const resetPassTemplatePath = path.join(
  TEMPALTES_DIR,
  "reset-password-email.html",
);
const verifyTemplateSource = await readFile(verifyEmailTemplatePath, "utf-8");
const resetTemplateSource = await readFile(resetPassTemplatePath, "utf-8");
const jwtSecret = getEnv("JWT_SECRET");
const appDomain = getEnv("APP_DOMAIN");

export const registerUser = async (payload) => {
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

  if (VERIFICATION) {
    const verifyToken = jwt.sign(
      {
        email,
      },
      jwtSecret,
      {
        expiresIn: "1h",
      },
    );

    const template = handlebars.compile(verifyTemplateSource);
    const html = template({
      name: newUser.name,
      link: `${appDomain}/auth/verify?verifyToken=${verifyToken}`,
    });

    await sendEmail({
      to: email,
      subject: "Email verification",
      html,
    });
  }

  return newUser;
};

export const verify = async (token) => {
  try {
    const { email } = jwt.verify(token, getEnv("JWT_SECRET"));
    const user = await getUser({ email });
    if (!user) {
      throw createHttpError(401, "User not found");
    }
    await UsersCollection.findOneAndUpdate(
      { _id: user._id },
      { isVerified: true },
    );
  } catch (err) {
    if (err instanceof Error) {
      throw createHttpError(401, err.message);
    }
    throw err;
  }
};

export const loginUser = async ({ email, password }) => {
  const user = await UsersCollection.findOne({ email });

  if (VERIFICATION) {
    if (!user.isVerified) {
      throw createHttpError(401, "Email not verified");
    }
  }

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

export const logoutUser = async (sessionId) => {
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

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
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

export const getSession = (filter) => SessionCollection.findOne(filter);
export const getUser = (filter) => UsersCollection.findOne(filter);

export const requestResetToken = async (email) => {
  const user = await getUser({ email });

  if (!user) {
    throw createHttpError(404, "User not found");
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    jwtSecret,
    {
      expiresIn: "15m",
    },
  );

  const template = handlebars.compile(resetTemplateSource);
  const html = template({
    name: user.name,
    link: `${appDomain}/auth/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    to: email,
    subject: "Reset your password",
    html,
  });
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, getEnv("JWT_SECRET"));
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
