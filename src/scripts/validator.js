const Ajv = require('ajv');

/**
 * Проверяет данные матрицы по JSON-схеме.
 * @param {Object} data - данные для проверки
 * @param {Object} schema - JSON-схема
 * @returns {Object} результат { valid: boolean, errors: null | Array }
 */
function validateData(data, schema) {
	const ajv = new Ajv();
	const validate = ajv.compile(schema);
	const valid = validate(data);
	return {
		valid,
		errors: validate.errors,
	};
}

module.exports = { validateData };
