import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "app/generated/**/*",
      "**/generated/**/*", 
      "node_modules/**/*",
      ".next/**/*",
      "out/**/*",
      "dist/**/*",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      ".env*",
      "next-env.d.ts",
      "public/**/*",
      "*.log",
      ".eslintcache"
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Prisma生成ファイル対応
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-require-imports": "off", 
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@next/next/no-img-element": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
