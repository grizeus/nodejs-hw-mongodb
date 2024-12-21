import Joi from "joi";

import { CONTACT_TYPES } from "../constants/index.js";

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  phoneNumber: Joi.string().min(3).max(30).required(),
  email: Joi.string().email(),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid(...CONTACT_TYPES).required(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  phoneNumber: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid(...CONTACT_TYPES),
});
