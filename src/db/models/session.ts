import { Types, Schema, model } from "mongoose";

import { handleSaveErr, setUpdateSettings } from "./hooks.js";
import type { Session } from "../../types/types.d.ts";

const sessionSchema = new Schema<Session>(
  {
    userId: {
      type: Types.ObjectId,
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

sessionSchema.post<Session>("save", handleSaveErr);
sessionSchema.pre<Session>("findOneAndUpdate", setUpdateSettings);
sessionSchema.post<Session>("findOneAndUpdate", handleSaveErr);

export const SessionCollection = model<Session>("session", sessionSchema);
