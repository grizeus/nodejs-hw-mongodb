import Joi from "joi";

export const createContactSchema = Joi.object({
  name: Joi.string().min(2).max(30).required(),
  phoneNumber: Joi.string().min(3).max(30).required(),
  email: Joi.string().email(),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid("work", "personal", "home").required(),
});
