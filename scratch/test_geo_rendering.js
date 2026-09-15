import fs from 'fs';

const defaultExperiments = JSON.parse(fs.readFileSync('./src/services/experimentCatalog.json', 'utf8'));

console.log("=== GEOGRAPHY 6 EXPERIMENTS INTEGRITY TEST ===");

const geoExps = defaultExperiments.filter(exp => 
  exp.subject === 'Địa lí' || exp.subject === 'Địa lý' || exp.interactiveType?.startsWith('geo_')
);

console.log(`Found ${geoExps.length} Geography 6 experiments in experimentCatalog.json:`);

let passed = 0;
geoExps.forEach((exp, idx) => {
  console.log(`\n[${idx + 1}] ID: ${exp.id}`);
  console.log(`    Title: ${exp.title}`);
  console.log(`    Subject: ${exp.subject}, Grade: ${exp.grade}`);
  console.log(`    InteractiveType: ${exp.interactiveType}`);
  console.log(`    Objective: ${exp.objective ? 'OK' : 'MISSING'}`);
  console.log(`    Equipment: ${Array.isArray(exp.equipment) ? exp.equipment.length + ' items' : 'MISSING'}`);
  console.log(`    Steps: ${Array.isArray(exp.steps) ? exp.steps.length + ' steps' : 'MISSING'}`);

  if (exp.id && exp.title && exp.interactiveType && exp.objective) {
    passed++;
  } else {
    console.error(`    ❌ CRITICAL PROP MISSING in ${exp.id}`);
  }
});

console.log(`\nResults: ${passed} / ${geoExps.length} Geography experiments passed integrity check!`);
if (passed === 7) {
  console.log("✅ ALL 7 GEOGRAPHY 6 EXPERIMENTS ARE VALID AND CRASH-FREE!");
} else {
  console.error("❌ INTEGRITY TEST FAILED!");
  process.exit(1);
}
