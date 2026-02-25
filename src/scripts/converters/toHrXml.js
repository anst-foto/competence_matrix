const fs = require('fs-extra');
const path = require('path');
const { create } = require('xmlbuilder2');

const ROOT_DIR = path.join(__dirname, '..', '..', '..');
const matrixPath = path.join(ROOT_DIR, 'data', 'competence_matrix.json');
const outputPath = path.join(ROOT_DIR, 'dist', 'export', 'hrxml.xml');

async function convertToHrXml() {
	const matrix = await fs.readJson(matrixPath);

	const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('CompetencyModel', {
		xmlns: 'http://ns.hr-xml.org/2007-04-15',
		'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
	});

	matrix.categories.forEach((category) => {
		category.subcategories.forEach((subcategory) => {
			subcategory.skills.forEach((skill) => {
				const competency = root.ele('Competency');

				competency
					.ele('CompetencyId')
					.txt(`${category.key}_${subcategory.name}_${skill.description.slice(0, 20)}`);
				competency.ele('CompetencyName').txt(skill.description);
				competency.ele('CompetencyDescription').txt(skill.description);

				const dimension = competency.ele('CompetencyDimension');
				dimension.ele('DimensionName').txt('Skill Type');
				dimension.ele('DimensionValue').txt(skill.type);

				const taxonomy = competency.ele('Taxonomy');
				taxonomy.ele('TaxonomyId').txt(category.key);
				taxonomy.ele('TaxonomyName').txt(category.name);
				taxonomy.ele('TaxonomyLevel').txt(subcategory.name);
			});
		});
	});

	const xml = root.end({ prettyPrint: true });
	await fs.ensureDir(path.dirname(outputPath));
	await fs.writeFile(outputPath, xml);
	console.log('✅ HR-XML файл создан:', outputPath);
}

convertToHrXml().catch((err) => {
	console.error('❌ Ошибка:', err);
	process.exit(1);
});
