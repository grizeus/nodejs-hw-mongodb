import { Document } from "mongoose";

import type { MongoServerError } from "../../types/types.d.ts";

export const handleSaveErr = (err: MongoServerError, doc: Document, next: any) => {
  const { name, code } = err;
  err.status = name === "MongoServerError" && code === 11000 ? 409 : 400;
  next();
};

export const setUpdateSettings = function(this: any, next: any) {
  this.options.new = true;
  this.options.runValidators = true;
  next();
}