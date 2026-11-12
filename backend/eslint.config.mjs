import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
	globalIgnores(["dist/**", "coverage/**", "eslint.config.mjs"]),
	js.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	{
		plugins: { import: importPlugin },
		languageOptions: {
			globals: globals.node,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
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
