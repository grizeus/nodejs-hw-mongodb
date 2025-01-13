import { Document, Query } from "mongoose";
import { NextFunction } from "express";
import type { MongoServerError,  } from "../../types/types.d.ts";

export const handleSaveErr = (
  err: MongoServerError,
  doc: Document,
  next: NextFunction,
) => {
  const { name, code } = err;
  err.status = name === "MongoServerError" && code === 11000 ? 409 : 400;
  next();
};

export const setUpdateSettings = function<T extends Document> (this: Query<T, T>, next: NextFunction) {
  this.setOptions({
    new: true,
    runValidators: true,
  });
  next();
};
