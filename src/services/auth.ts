import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
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
  TEMPLATES_DIR,
} from "../constants/index.js";
import type {
  AuthPayload,
  ExtendedJwtPayload,
  User,
} from "../types/types.d.ts";
import {
  getFullNameFromGoogleTokenPayload,
  validateCode,
} from "../utils/googleOAuth2.js";

const VERIFICATION = getEnvVar("ENABLE_VERIFICATION") === "true";
const verifyEmailTemplatePath = path.join(TEMPLATES_DIR, "verify-email.html");
const resetPassTemplatePath = path.join(
  TEMPLATES_DIR,
  "reset-password-email.html",
);
const verifyTemplateSource = await readFile(verifyEmailTemplatePath, "utf-8");
const resetTemplateSource = await readFile(resetPassTemplatePath, "utf-8");
const jwtSecret = getEnvVar("JWT_SECRET");
const appDomain = getEnvVar("APP_DOMAIN");

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

export const verify = async (token: string) => {
  try {
    const { email } = jwt.verify(token, jwtSecret) as JwtPayload;
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
  }
};

export const loginUser = async (payload: AuthPayload) => {
  const { email, password } = payload;
  const user = (await UsersCollection.findOne({ email })) as User;

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

  const session = await SessionCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: Date.now() + accessTokenLifetime,
    refreshTokenValidUntil: Date.now() + refreshTokenLifetime,
  });

  return {
    name: user.name,
    email,
    session,
  };
};

export const loginOrSignupWithGoogle = async (code: string) => {
  const loginTicket = await validateCode(code);
  const payload = loginTicket.getPayload();
  if (!payload) {
    throw createHttpError(401);
  }
  let user = await UsersCollection.findOne({
    email: payload.email,
  });

  if (!user) {
    const password = await bcrypt.hash(randomBytes(10), 10);
    user = await UsersCollection.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password,
      isVerified: true,
    });
  }

  const newSession = createSession();
  return {
    name: user.name,
    email: user.email,
    session: await SessionCollection.create({
      userId: user._id,
      ...newSession,
    }),
  };
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

export const refreshUsersSession = async (sessionId: Types.ObjectId) => {
  const oldSession = await SessionCollection.findOne({
    _id: sessionId,
  });

  console.log(`oldSession ${oldSession}`);

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

export const resetPassword = async (payload: {
  token: string;
  password: string;
}) => {
  let entries: ExtendedJwtPayload;

  try {
    entries = jwt.verify(payload.token, jwtSecret) as ExtendedJwtPayload;
  } catch (err) {
    if (err instanceof Error) {
      throw createHttpError(401, err.message);
    }
    throw err;
  }

  const user = await getUser({
    email: entries.email,
    _id: entries.sub,
  });
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
};
