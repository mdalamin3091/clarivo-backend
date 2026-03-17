import js from "@eslint/js";
import parser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";
import globals from "globals";

import tseslint from "typescript-eslint";

export default defineConfig([
  // TypeScript support
  ...tseslint.configs.recommended,

  // JS base config
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      js,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },

  // TypeScript specific config
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parser: parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: eslintPluginImport,
    },
  },

  // Prettier integration
  {
    files: ["**/*.{js,ts}"],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    extends: [eslintConfigPrettier],
    rules: {
      "no-console": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "prettier/prettier": "off",
      "import/extensions": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Ignore specific folders
  {
    ignores: ["node_modules/**", "dist/**", "**/*.d.ts"],
  },
]);
