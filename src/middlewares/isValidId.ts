import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import createHttpError from "http-errors";

export const isValidId = (req: Request, res: Response, next: NextFunction) => {
  const { contactId } = req.params;
  if (!isValidObjectId(contactId)) {
    throw createHttpError(400, "Bad Request");
  }

  next();
};
