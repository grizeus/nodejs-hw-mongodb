import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  throw createHttpError(404, "Route not Found");
};
