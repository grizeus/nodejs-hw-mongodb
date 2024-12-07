import express from "express";
import cors from "cors";
import pino from "pino-http";

import contactsRouter from "./routers/contacts.js";
import { getEnvVar } from "./utils/getEnvVar.js";

const PORT = Number(getEnvVar("PORT", 3000));

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(
    pino({
      transport: {
        target: "pino-pretty",
      },
    }),
  );
  app.use(contactsRouter);
  app.use("*", (req, res, next) => {
    res.status(404).json({
      message: "Not found",
    });
  });

  app.use((err, req, res, next) => {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
