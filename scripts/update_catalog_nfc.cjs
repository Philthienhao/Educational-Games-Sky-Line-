const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../src/services/textbookCatalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

let updated = 0;
const normalizedCatalog = catalog.map(item => {
  if (item.fileName) {
    const nfcName = item.fileName.normalize('NFC');
    if (nfcName !== item.fileName) {
      updated++;
      return { ...item, fileName: nfcName };
    }
  }
  return item;
});

fs.writeFileSync(catalogPath, JSON.stringify(normalizedCatalog, null, 2), 'utf8');
console.log(`Updated ${updated} catalog items to NFC normalization.`);
