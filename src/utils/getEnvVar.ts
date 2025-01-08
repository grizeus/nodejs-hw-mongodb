import dotenv from "dotenv";

dotenv.config();

export const getEnvVarWithDefault = (key: string, defaultValue: string) => {
  const value = process.env[key];

  if (value) {
    return value;
  }

  if (defaultValue) {
    return defaultValue;
  }

  throw new Error(`Missing: process.env.['${key}']`);
};

export const getEnvVar = (key: string) => {
  const value = process.env[key];

  if (value) {
    return value;
  }

  throw new Error(`Missing: process.env.['${key}']`);
};