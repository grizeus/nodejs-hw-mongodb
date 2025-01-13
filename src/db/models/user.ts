import { Schema, model } from "mongoose";

import { handleSaveErr, setUpdateSettings } from "./hooks.js";
import { emailRegExp } from "../../constants/index.js";
import type { User } from "../../types/types.d.ts";

const usersSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      match: emailRegExp,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

usersSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const USER_KEYS = Object.keys(usersSchema.paths); // NOTE: leave for now

usersSchema.post<User>("save", handleSaveErr);
usersSchema.pre<User>("findOneAndUpdate", setUpdateSettings);
usersSchema.post<User>("findOneAndUpdate", handleSaveErr);

export const UsersCollection = model<User>("user", usersSchema);
