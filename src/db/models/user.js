import { Schema, model } from "mongoose";

import { handleSaveErr, setUpdateSettings } from "./hooks.js";
import { emailRegExp } from "../../constants/index.js";

const usersSchema = new Schema(
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const USER_KEYS = Object.keys(usersSchema.paths); // NOTE: leave for now

usersSchema.post("save", handleSaveErr);
usersSchema.pre("findOneAndUpdate", setUpdateSettings);
usersSchema.post("findOneAndUpdate", handleSaveErr);

export const UsersCollection = model("user", usersSchema);
