import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
	globalIgnores(["dist/**"]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat["recommended-latest"],
			reactRefresh.configs.vite,
			jsxA11y.flatConfigs.recommended,
		],
		plugins: { import: importPlugin },
		languageOptions: {
			ecmaVersion: 2023,
			globals: globals.browser,
			parserOptions: { jsxPragma: null },
		},
		rules: {
			"import/order": [
				"error",
				{
					groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"]],
					pathGroups: [{ pattern: "@/**", group: "internal" }],
					"newlines-between": "always",
					alphabetize: { order: "asc", caseInsensitive: true },
					named: true,
				},
			],
			"import/no-duplicates": "error",
			"no-restricted-imports": [
				"error",
				{ patterns: [{ regex: "(^|/)\\.\\./", message: 'Use "@/…" instead of "../".' }] },
			],
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ vars: "all", args: "none", ignoreRestSiblings: true, caughtErrors: "all" },
			],
		},
	},
	prettier,
]);
