const fs = require('fs-extra');
const path = require('path');
const Ajv = require('ajv');

const DATA_FILE = path.join(__dirname, '..', 'data', 'competence_matrix.json');
const SCHEMA_FILE = path.join(__dirname, '..', 'data', 'competence_matrix.schema.json');

async function validate() {
    try {
        const matrixData = await fs.readJson(DATA_FILE);
        const schema = await fs.readJson(SCHEMA_FILE);

        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const valid = validate(matrixData);

        if (!valid) {
            console.error('❌ JSON не прошёл валидацию:');
            console.error(validate.errors);
            process.exit(1);
        }

        console.log('✅ JSON успешно проверен по схеме');
    } catch (error) {
        console.error('❌ Ошибка при валидации:', error.message);
        process.exit(1);
    }
}

validate();