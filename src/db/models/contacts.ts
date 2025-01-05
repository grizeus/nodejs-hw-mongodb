import { Types, Schema, model } from "mongoose";
import { CONTACT_TYPES } from "../../constants/index.js";
import { handleSaveErr, setUpdateSettings } from "./hooks.js";
import type { Contact } from "../../types/types.d.ts";

const contactSchema = new Schema<Contact>(
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
      type: Types.ObjectId,
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

contactSchema.post<Contact>("save", handleSaveErr);
contactSchema.pre<Contact>("findOneAndUpdate", setUpdateSettings);
contactSchema.post<Contact>("findOneAndUpdate", handleSaveErr);

export const ContactsCollection = model<Contact>("contact", contactSchema);
