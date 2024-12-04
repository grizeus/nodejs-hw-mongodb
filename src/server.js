import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pino from "pino-http";

dotenv.config();

const PORT = parseInt(process.env.PORT) || 3000;

export const setupServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

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
