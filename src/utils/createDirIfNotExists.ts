import fs from "node:fs/promises";

type FileSystemError = {
  code: string;
  message: string;
};

// function predicate
const isFileSystemError = (error: unknown): error is FileSystemError => {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error
  );
};

export const createDirIfNotExists = async (url: string) => {
  try {
    await fs.access(url);
  } catch (err: unknown) {
    if (isFileSystemError(err) && err.code === "ENOENT") {
      await fs.mkdir(url);
    }
  }
};
