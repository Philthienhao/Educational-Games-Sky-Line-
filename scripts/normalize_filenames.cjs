const fs = require('fs');
const path = require('path');

const textbooksDir = path.join(__dirname, '../public/textbooks');

function renameToNFC(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    const nfcName = entry.name.normalize('NFC');
    if (entry.name !== nfcName) {
      const newPath = path.join(dir, nfcName);
      console.log(`Renaming NFD -> NFC: ${entry.name} -> ${nfcName}`);
      fs.renameSync(fullPath, newPath);
    }
    if (entry.isDirectory()) {
      renameToNFC(fullPath);
    }
  });
}

renameToNFC(textbooksDir);
console.log('Finished NFC normalization check of public/textbooks.');
