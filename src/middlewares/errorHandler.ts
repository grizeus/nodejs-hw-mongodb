import { Request, Response, NextFunction } from "express";
import createHttpError, { HttpError } from "http-errors";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: err.status,
      message: err.name,
      data: err,
    });
    return;
  }

  const newErr = createHttpError(500, err.message);
  const { status = 500, message } = newErr;
  res.status(status).json({
    status,
    message,
  });
};
