import path from "node:path";
import fs from "node:fs/promises";
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from "../constants/index.js";
import { getEnvVar } from "./getEnvVar.js";

export const saveFileToUploadDir = async (file: Express.Multer.File) => {
  await fs.rename(
    path.join(TEMP_UPLOAD_DIR, file.filename),
    path.join(UPLOAD_DIR, file.filename),
  );

  return `${getEnvVar("APP_DOMAIN")}/uploads/${file.filename}`;
};

export const deleteFileFromUploadDir = async (filename: string) => {
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(filePath);
    console.log(`File ${filename} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error);
  }
};