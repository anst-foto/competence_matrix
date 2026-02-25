const fs = require('fs-extra');
const path = require('path');
const { DataFactory, Writer } = require('n3');
const { namedNode, literal } = DataFactory;

const matrixPath = path.join(__dirname, '..', '..', '..', 'data', 'competence_matrix.json');
const outputPath = path.join(__dirname, '..', '..', '..', 'dist', 'export', 'matrix.ttl');

const BASE = 'http://yourdomain.org/matrix#';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
const CORE = 'https://purl.org/coreo#';

async function convertToTurtle() {
	try {
		const matrix = await fs.readJson(matrixPath);

		const writer = new Writer({
			prefixes: {
				'': BASE,
				rdf: RDF,
				rdfs: RDFS,
				coreo: CORE,
			},
		});

		matrix.categories.forEach((category) => {
			const categoryUri = namedNode(BASE + category.key);

			writer.addQuad(categoryUri, namedNode(RDF + 'type'), namedNode(CORE + 'CompetenceCategory'));
			writer.addQuad(categoryUri, namedNode(RDFS + 'label'), literal(category.name, 'ru'));

			category.subcategories.forEach((subcategory, subIdx) => {
				const subUri = namedNode(`${BASE}${category.key}_sub${subIdx}`);

				writer.addQuad(subUri, namedNode(RDF + 'type'), namedNode(CORE + 'CompetenceSubcategory'));
				writer.addQuad(subUri, namedNode(RDFS + 'label'), literal(subcategory.name, 'ru'));
				writer.addQuad(subUri, namedNode(CORE + 'partOf'), categoryUri);

				subcategory.skills.forEach((skill, skillIdx) => {
					const skillUri = namedNode(`${BASE}${category.key}_sub${subIdx}_skill${skillIdx}`);
					const skillType = skill.type === 'hard' ? CORE + 'HardSkill' : CORE + 'SoftSkill';

					writer.addQuad(skillUri, namedNode(RDF + 'type'), namedNode(skillType));
					writer.addQuad(skillUri, namedNode(RDFS + 'label'), literal(skill.description, 'ru'));
					writer.addQuad(skillUri, namedNode(CORE + 'partOf'), subUri);
				});
			});
		});

		writer.end((error, result) => {
			if (error) {
				console.error('❌ Ошибка генерации Turtle:', error);
				return;
			}
			fs.ensureDirSync(path.dirname(outputPath));
			fs.writeFileSync(outputPath, result);
			console.log('✅ Turtle файл создан:', outputPath);
		});
	} catch (err) {
		console.error('❌ Ошибка:', err);
		process.exit(1);
	}
}

convertToTurtle();
