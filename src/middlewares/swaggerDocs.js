import createHttpError from "http-errors";
import swaggerUI from "swagger-ui-express";
import { readFileSync } from "node:fs";

import { SWAGGER_PATH } from "../constants/index.js";

export const swaggerDocs = () => {
  try {
    const swaggerDoc = JSON.parse(readFileSync(SWAGGER_PATH, "utf-8"));
    return [...swaggerUI.serve, swaggerUI.setup(swaggerDoc)];
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    throw createHttpError(500, "Can't load swagger docs");
  }
};
