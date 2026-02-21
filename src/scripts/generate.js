const fs = require('fs-extra');
const path = require('path');
const pug = require('pug');
const less = require('less');
const { validateData } = require('./validator');

const ROOT_DIR = path.join(__dirname, '..', '..');
const SRC_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const DATA_DIR = path.join(ROOT_DIR, 'data');
const DATA_FILE = path.join(DATA_DIR, 'competence_matrix.json');
const SCHEMA_FILE = path.join(DATA_DIR, 'competence_matrix.schema.json');

/**
 * Генерирует LESS-файл с переменными количества подкатегорий на основе данных матрицы.
 * @param {Object} matrixData - данные матрицы
 * @param {string} outputPath - путь для сохранения сгенерированного .less файла
 */
function generateSubcatCountLess(matrixData, outputPath) {
	let content = '// Автоматически сгенерировано из JSON. Не редактировать вручную.\n\n';
	matrixData.categories.forEach((cat) => {
		content += `@${cat.key}-subcat-count: ${cat.subcategories.length};\n`;
	});
	fs.writeFileSync(outputPath, content);
	console.log('✅ Сгенерирован _generated.less с количеством подкатегорий');
}

/**
 * Компилирует LESS-файлы в CSS.
 * @param {string[]} lessFiles - массив путей к .less файлам (будут объединены)
 * @param {string} outputCssPath - путь для сохранения итогового .css файла
 * @returns {Promise<void>}
 */
async function compileLess(lessFiles, outputCssPath) {
	const combinedContent = lessFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
	try {
		const result = await less.render(combinedContent, { filename: lessFiles[0] });
		fs.writeFileSync(outputCssPath, result.css);
		console.log('✅ LESS скомпилирован в CSS');
	} catch (err) {
		console.error('❌ Ошибка компиляции LESS:', err);
		throw err;
	}
}

/**
 * Рендерит Pug-шаблон в HTML.
 * @param {string} templatePath - путь к .pug файлу
 * @param {Object} data - данные для шаблона
 * @param {string} outputHtmlPath - путь для сохранения .html файла
 */
function renderPug(templatePath, data, outputHtmlPath) {
	try {
		const html = pug.renderFile(templatePath, {
			matrix: data,
			pretty: true,
		});
		fs.writeFileSync(outputHtmlPath, html);
		console.log('✅ Pug скомпилирован в HTML');
	} catch (err) {
		console.error('❌ Ошибка рендеринга Pug:', err);
		throw err;
	}
}

async function build() {
	try {
		fs.emptyDirSync(DIST_DIR);

		const matrixData = fs.readJsonSync(DATA_FILE);
		const schema = fs.readJsonSync(SCHEMA_FILE);
		const { valid, errors } = validateData(matrixData, schema);
		if (!valid) {
			console.error('❌ JSON не прошёл валидацию:');
			console.error(errors);
			process.exit(1);
		}

		const generatedLessPath = path.join(SRC_DIR, 'styles', '_generated.less');
		generateSubcatCountLess(matrixData, generatedLessPath);

		const lessFiles = [
			path.join(SRC_DIR, 'styles', 'colors.less'),
			path.join(SRC_DIR, 'styles', 'styles.less'),
		];
		const cssOutputPath = path.join(DIST_DIR, 'styles.css');
		await compileLess(lessFiles, cssOutputPath);

		const pugTemplatePath = path.join(SRC_DIR, 'templates', 'index.pug');
		const htmlOutputPath = path.join(DIST_DIR, 'index.html');
		renderPug(pugTemplatePath, matrixData, htmlOutputPath);

		const clientJsSrc = path.join(SRC_DIR, 'scripts', 'client', 'rating.js');
		const clientJsDest = path.join(DIST_DIR, 'js', 'rating.js');
		if (fs.existsSync(clientJsSrc)) {
			fs.ensureDirSync(path.join(DIST_DIR, 'js'));
			fs.copyFileSync(clientJsSrc, clientJsDest);
			console.log('✅ Клиентский скрипт скопирован в dist/js');
		} else {
			console.warn('⚠️ Клиентский скрипт не найден');
		}

		console.log('✅ Сайт успешно сгенерирован в папке dist/');
	} catch (err) {
		console.error('❌ Сборка прервана из-за ошибки', err);
		process.exit(1);
	}
}

build();
