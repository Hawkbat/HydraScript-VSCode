/* eslint-disable */
module.exports = {
	"env": {
		"browser": true,
	},
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
	],
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"project": ["./tsconfig.json", "./shared/tsconfig.json", "./build/tsconfig.json", "./host/tsconfig.json", "./client/tsconfig.json"],
		"sourceType": "module",
	},
	"plugins": [
		"@typescript-eslint",
		"react",
		"react-hooks",
	],
	"rules": {
		"@typescript-eslint/indent": ["error", "tab"],
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/member-delimiter-style": [
			"error",
			{
				"multiline": {
					"delimiter": "none",
					"requireLast": true,
				},
				"singleline": {
					"delimiter": "comma",
					"requireLast": false,
				}
			}
		],
		"@typescript-eslint/semi": [
			"error",
			"never",
		],
		"@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
		"comma-dangle": ["error", "always-multiline"],
		"curly": ["error", "all"],
		"semi": "off"
	}
}
