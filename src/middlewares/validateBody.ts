import { Request, Response, NextFunction } from "express";
import { ValidationError } from "joi";
import { ObjectSchema } from "joi";
import createHttpError from "http-errors";

export const validateBody = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body, {
        abortEarly: false,
      });
      next();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err instanceof ValidationError) {
        next(
          createHttpError(400, "ValidationError", { errors: err.details }),
        );
      }
    }
  };
};
