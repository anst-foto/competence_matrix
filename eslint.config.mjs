import globals from 'globals';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';

export default [
	js.configs.recommended,
	{
		ignores: [
			'node_modules/',
			'dist/',
			'build/',
			'coverage/',
			'public/',
			'*.min.js',
			'*.config.js',
			'.editorconfig',
		],
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			...js.configs.recommended.rules,
			'no-console': 'warn',
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		},
	},
	{
		files: ['src/scripts/**/*.js'],
		rules: {
			'no-console': 'off',
		},
	},
	{
		files: ['src/client/**/*.js'],
		rules: {
			'no-console': 'warn',
		},
	},
	prettierConfig,
];
