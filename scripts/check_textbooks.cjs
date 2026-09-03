const fs = require('fs');
const path = require('path');

const textbooksDir = path.join(__dirname, '../public/textbooks');
const catalogPath = path.join(__dirname, '../src/services/textbookCatalog.json');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log(`Catalog has ${catalog.length} items.`);

let foundCount = 0;
let missingCount = 0;

catalog.forEach((item, index) => {
  if (!item.fileName || item.fileName.endsWith('.txt')) return;
  
  const diskPath = path.join(textbooksDir, item.fileName);
  const exists = fs.existsSync(diskPath);
  
  if (exists) {
    foundCount++;
  } else {
    missingCount++;
    console.log(`[MISSING ${index}] item.fileName: "${item.fileName}"`);
    // Try NFC vs NFD
    const nfcPath = path.join(textbooksDir, item.fileName.normalize('NFC'));
    const nfdPath = path.join(textbooksDir, item.fileName.normalize('NFD'));
    console.log(`  - NFC exists? ${fs.existsSync(nfcPath)}`);
    console.log(`  - NFD exists? ${fs.existsSync(nfdPath)}`);
  }
});

console.log(`Found: ${foundCount}, Missing: ${missingCount}`);
