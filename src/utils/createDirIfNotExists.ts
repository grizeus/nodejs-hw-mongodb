import fs from "node:fs/promises";

export const createDirIfNotExists = async (url: string) => {
  try {
    await fs.access(url);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await fs.mkdir(url);
    }
  }
};
