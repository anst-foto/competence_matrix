const fs = require('fs-extra');
const path = require('path');
const { validateData } = require('./validator');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'competence_matrix.json');
const SCHEMA_FILE = path.join(DATA_DIR, 'competence_matrix.schema.json');

async function validate() {
	try {
		const matrixData = await fs.readJson(DATA_FILE);
		const schema = await fs.readJson(SCHEMA_FILE);

		const { valid, errors } = validateData(matrixData, schema);

		if (!valid) {
			console.error('❌ JSON не прошёл валидацию:');
			console.error(errors);
			process.exit(1);
		}

		console.log('✅ JSON успешно проверен по схеме');
	} catch (error) {
		console.error('❌ Ошибка при валидации:', error.message);
		process.exit(1);
	}
}

validate();
