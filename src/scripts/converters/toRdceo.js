const fs = require('fs-extra');
const path = require('path');
const { create } = require('xmlbuilder2');

const ROOT_DIR = path.join(__dirname, '..', '..', '..');
const matrixPath = path.join(ROOT_DIR, 'data', 'competence_matrix.json');
const outputPath = path.join(ROOT_DIR, 'dist', 'export', 'rdceo.xml');

async function convertToRdceo() {
	const matrix = await fs.readJson(matrixPath);

	const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('rdceo', {
		xmlns: 'http://www.imsglobal.org/xsd/imsrdceo_rootv1p0',
		'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
		'xsi:schemaLocation': 'http://www.imsglobal.org/xsd/imsrdceo_rootv1p0 imsrdceo_rootv1p0.xsd',
	});

	matrix.categories.forEach((category) => {
		category.subcategories.forEach((subcategory) => {
			subcategory.skills.forEach((skill) => {
				const rdceo = root.ele('rdceo');

				const id = `${category.key}_${subcategory.name.replace(/[^a-z0-9]/gi, '_')}_${skill.description.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}`;
				rdceo.ele('identifier').txt(id);

				const title = rdceo.ele('title');
				title.ele('langstring', { language: 'ru' }).txt(skill.description);

				const description = rdceo.ele('description');
				description.ele('langstring', { language: 'ru' }).txt(skill.description);

				const definition = rdceo.ele('definition');
				const statement = definition.ele('statement');
				statement.ele('statementname').txt('type');
				statement
					.ele('statementtoken', { source: 'http://yourdomain.com/skill-type' })
					.txt(skill.type);

				const metadata = rdceo.ele('metadata');
				const lom = metadata.ele('lom', { xmlns: 'http://ltsc.ieee.org/xsd/LOM' });
				lom
					.ele('general')
					.ele('title')
					.ele('string', { language: 'ru' })
					.txt(`${category.name} → ${subcategory.name}`);
			});
		});
	});

	const xml = root.end({ prettyPrint: true });
	await fs.ensureDir(path.dirname(outputPath));
	await fs.writeFile(outputPath, xml);
	console.log('✅ RDCEO файл создан:', outputPath);
}

convertToRdceo().catch((err) => {
	console.error('❌ Ошибка:', err);
	process.exit(1);
});
