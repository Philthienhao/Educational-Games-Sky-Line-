import fs from 'fs';
import path from 'path';

const catalog = JSON.parse(fs.readFileSync('src/services/experimentCatalog.json', 'utf8'));
const canvasCode = fs.readFileSync('src/components/experiments/InteractiveExperimentCanvas.jsx', 'utf8');

const geoExps = catalog.filter(exp => exp.subject === 'Địa lí' || exp.interactiveType?.startsWith('geo_'));

console.log(`Checking ${geoExps.length} Geography experiments in experimentCatalog.json...`);

let missingHandlers = 0;
geoExps.forEach(exp => {
  const type = exp.interactiveType;
  const hasCase = canvasCode.includes(`case '${type}':`);
  if (!hasCase) {
    console.error(`❌ MISSING SWITCH CASE in InteractiveExperimentCanvas for type: '${type}' (ID: ${exp.id})`);
    missingHandlers++;
  } else {
    console.log(`✅ FOUND switch case for '${type}' (${exp.title})`);
  }
});

console.log(`\nCatalog verification complete: ${geoExps.length - missingHandlers}/${geoExps.length} switch cases present.`);
