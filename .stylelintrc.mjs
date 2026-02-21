export default {
	plugins: ['stylelint-prettier'],
	extends: ['stylelint-config-standard', 'stylelint-config-standard-less'],
	rules: {
		'prettier/prettier': true,
		'selector-class-pattern': null,
		'color-function-notation': 'legacy',
	},
};
