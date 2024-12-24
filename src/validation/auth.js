import Joi from "joi";

import { emailRegExp } from "../constants/index.js";

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().pattern(emailRegExp).required(),
  password: Joi.string().min(8).required(),
});

export const sessionSchema = Joi.object({
  userId: Joi.string().required(),
  accessToken: Joi.string().required(),
  refreshToken: Joi.string().required(),
  accessTokenValidUntil: Joi.date().required(),
  refreshTokenValidUntil: Joi.date().required(),
});
