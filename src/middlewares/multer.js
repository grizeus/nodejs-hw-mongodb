import multer from "multer";
import { TEMP_UPLOAD_DIR } from "../constants/index.js";
import createHttpError from "http-errors";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniquePrefix}_${file.originalname}`);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 5,
};

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split(".").pop();
  if (ext === "exe" || ext === "EXE") {
    cb(createHttpError(400, "Files with .exe extention not allowed"));
  }
  cb(null, true);
};

export const upload = multer({ storage, limits, fileFilter });
