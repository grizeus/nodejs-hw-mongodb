import { Schema, model } from "mongoose";

import { CONTACT_TYPES } from "../../constants/index.js";
import { handleSaveErr, setUpdateSettings } from "./hooks.js";

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    isFavourite: {
      type: Boolean,
      default: false,
      required: true,
    },
    contactType: {
      type: String,
      enum: CONTACT_TYPES,
      default: "personal",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    photo: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const CONTACT_KEYS = Object.keys(contactSchema.paths);

contactSchema.post("save", handleSaveErr);
contactSchema.pre("findOneAndUpdate", setUpdateSettings);
contactSchema.post("findOneAndUpdate", handleSaveErr);

export const ContactsCollection = model("contact", contactSchema);
