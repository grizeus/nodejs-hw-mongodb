import multer, { FileFilterCallback } from "multer";
import createHttpError from "http-errors";
import { Request } from "express";

import { TEMP_UPLOAD_DIR } from "../constants/index.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniquePrefix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniquePrefix}_${file.originalname}`);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 5,
};

const fileFilter = (
  req: Request,
  file: globalThis.Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  const ext = file.originalname.split(".").pop();
  if (ext === "exe" || ext === "EXE") {
    cb(createHttpError(400, "Files with .exe extension not allowed"));
  }
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const upload = multer({ storage, limits, fileFilter });
