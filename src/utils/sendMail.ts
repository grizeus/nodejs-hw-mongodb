import nodemailer from "nodemailer";
import createHttpError from "http-errors";

import { SMTP } from "../constants/index.js";
import getEnv from "./getEnvVar.js";

const transporter = nodemailer.createTransport({
  host: getEnv(SMTP.SMTP_HOST),
  port: Number(getEnv(SMTP.SMTP_PORT)),
  auth: {
    user: getEnv(SMTP.SMTP_USER),
    pass: getEnv(SMTP.SMTP_PASSWORD),
  },
});

export const sendEmail = async (options) => {
  try {
    return await transporter.sendMail(options);
  } catch (err) {

    if (err instanceof Error) {
      throw new createHttpError(
        500,
        "Failed to send the email, please try again later.",
      );
    }
    throw err;
  }
};
