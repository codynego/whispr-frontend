import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginUnusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Next.js defaults
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Custom rules and plugins
  {
    plugins: {
      "unused-imports": eslintPluginUnusedImports,
    },
    rules: {
      // Remove or warn about unused imports/vars
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      // Optional: stricter TypeScript linting
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "off",
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    "scripts": {
      "lint": "next lint",
      "lint:fix": "eslint . --fix"
    },

  },
];

export default eslintConfig;
