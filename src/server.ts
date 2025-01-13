import express from "express";
import cors from "cors";
import pino from "pino-http";
import cookieParser from "cookie-parser";

import router from "./routers/index.js";
import { getEnvVarWithDefault } from "./utils/getEnvVar.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { UPLOAD_DIR } from "./constants/index.js";
import { swaggerDocs } from "./middlewares/swaggerDocs.js";

const PORT = Number(getEnvVarWithDefault("PORT", "3000"));

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(cookieParser());
  app.use(
    express.json({
      type: "application/json",
      limit: "1kb",
    }),
  );

  app.use(
    pino.default({
      transport: {
        target: "pino-pretty",
      },
    }),
  );

  app.use("/uploads", express.static(UPLOAD_DIR));
  app.use("/api-docs", swaggerDocs());
  app.use(router);
  app.use("*", notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
