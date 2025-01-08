import nodemailer from "nodemailer";
import createHttpError from "http-errors";

import { SMTP } from "../constants/index.js";
import {getEnvVar} from "./getEnvVar.js";

const transporter = nodemailer.createTransport({
  host: getEnvVar(SMTP.SMTP_HOST),
  port: Number(getEnvVar(SMTP.SMTP_PORT)),
  auth: {
    user: getEnvVar(SMTP.SMTP_USER),
    pass: getEnvVar(SMTP.SMTP_PASSWORD),
  },
});

export const sendEmail = async (options: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    return await transporter.sendMail(options);
  } catch (err) {

    if (err instanceof Error) {
      throw createHttpError(
        500,
        "Failed to send the email, please try again later.",
      );
    }
    throw err;
  }
};
