import globals from "globals";
import js from "@eslint/js";
import * as tslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node },
    },
    files: ["src/**/*.ts"],
    rules: {
      semi: "error",
      "no-unused-vars": ["error", { args: "none" }],
      "no-undef": "error",
    },
  },
];
