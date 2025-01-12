import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import createHttpError from "http-errors";

export const validateBody = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body, {
        abortEarly: false,
      });
      next();
    } catch (err: any) {
      next(
        createHttpError(400, "Bad Request", {
          errors: err.details,
        }),
      );
    }
  };
};
