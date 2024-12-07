import dotenv from "dotenv";

dotenv.config();

export const getEnvVar = (key, defaultValue) => {
  const value = process.env[key];

  if (value) {
    return value;
  }

  if (defaultValue) {
    return defaultValue;
  }

  throw new Error(`Missing: process.env.['${key}']`);
};