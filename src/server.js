import express from "express";
import cors from "cors";
import pino from "pino-http";

import { getEnvVar } from "./utils/getEnvVar.js";
import { getAllContacts } from "./services/contacts.js";

const PORT = getEnvVar("PORT", 3000);

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

  app.get("/", (req, res) => {
    res.json({
      message: "Hello world!",
    });
  });

  app.get("/contacts", async (req, res) => {
    const contacts = await getAllContacts();
    console.log(contacts);
    res.status(200).json({
      status: "200",
      message: "Contacts retrieved successfully",
      data: contacts,
    });
  });

  app.use((err, req, res, next) => {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  });

  app.use("*", (req, res, next) => {
    res.status(404).json({
      message: "Not found",
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
