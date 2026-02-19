const fs = require('fs-extra');
const path = require('path');
const pug = require('pug');
const less = require('less');
const Ajv = require('ajv');

const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');
const DATA_FILE = path.join(__dirname, 'data', 'competence_matrix.json');
const SCHEMA_FILE = path.join(__dirname, 'data', 'competence_matrix.schema.json');

fs.emptyDirSync(DIST_DIR);

const matrixData = fs.readJsonSync(DATA_FILE);
const schema = fs.readJsonSync(SCHEMA_FILE);

const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(matrixData);
if (!valid) {
    console.error('JSON не прошёл валидацию:');
    console.error(validate.errors);
    process.exit(1);
}

const colorsFile = path.join(SRC_DIR, 'styles', 'colors.less');
const stylesFile = path.join(SRC_DIR, 'styles', 'style.less');
let lessContent = fs.readFileSync(colorsFile, 'utf8') + '\n' + fs.readFileSync(stylesFile, 'utf8');

less.render(lessContent, { filename: stylesFile })
    .then(output => {
        fs.writeFileSync(path.join(DIST_DIR, 'style.css'), output.css);
    })
    .catch(err => {
        console.error('LESS Error:', err);
    });

const pugFile = path.join(SRC_DIR, 'templates', 'index.pug');
const html = pug.renderFile(pugFile, { matrix: matrixData });
fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html);

console.log('✅ Сайт сгенерирован в папке dist/');