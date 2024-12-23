import express from "express";
import cors from "cors";
import pino from "pino-http";

import router from "./routers/index.js";
import { getEnvVar } from "./utils/getEnvVar.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";

const PORT = Number(getEnvVar("PORT", 3000));

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(
    express.json({
      type: "application/json",
      limit: "1kb",
    }),
  );

  app.use(
    pino({
      transport: {
        target: "pino-pretty",
      },
    }),
  );

  app.use(router);
  app.use("*", notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
