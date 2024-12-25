import { Schema, model } from "mongoose";

import { handleSaveErr, setUpdateSettings } from "./hooks.js";

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    accessTokenValidUntil: {
      type: Date,
      required: true,
    },
    refreshTokenValidUntil: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

sessionSchema.post("save", handleSaveErr);
sessionSchema.pre("findOneAndUpdate", setUpdateSettings);
sessionSchema.post("findOneAndUpdate", handleSaveErr);

export const SessionCollection = model("session", sessionSchema);
