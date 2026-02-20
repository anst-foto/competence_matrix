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

let generatedLess = '// Автоматически сгенерировано из JSON. Не редактировать вручную.\n\n';
matrixData.categories.forEach((cat) => {
  const count = cat.subcategories.length;
  generatedLess += `@${cat.key}-subcat-count: ${count};\n`;
});

const generatedFilePath = path.join(SRC_DIR, 'styles', '_generated.less');
fs.writeFileSync(generatedFilePath, generatedLess);
console.log('✅ Сгенерирован _generated.less с количеством подкатегорий');

const colorsFile = path.join(SRC_DIR, 'styles', 'colors.less');
const stylesFile = path.join(SRC_DIR, 'styles', 'styles.less');
let lessContent = fs.readFileSync(colorsFile, 'utf8') + '\n' + fs.readFileSync(stylesFile, 'utf8');

less
  .render(lessContent, { filename: stylesFile })
  .then((output) => {
    fs.writeFileSync(path.join(DIST_DIR, 'styles.css'), output.css);
  })
  .catch((err) => {
    console.error('LESS Error:', err);
  });

const pugFile = path.join(SRC_DIR, 'templates', 'index.pug');
const html = pug.renderFile(pugFile, {
  matrix: matrixData,
  pretty: true,
});
fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html);

const JS_SRC_DIR = path.join(SRC_DIR, 'js');
const JS_DIST_DIR = path.join(DIST_DIR, 'js');
if (fs.existsSync(JS_SRC_DIR)) {
  fs.ensureDirSync(JS_DIST_DIR);
  fs.copySync(JS_SRC_DIR, JS_DIST_DIR);
  console.log('✅ Клиентские скрипты скопированы в dist/js');
}

console.log('✅ Сайт сгенерирован в папке dist/');
