const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function processPdf(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text || '';
    return text.replace(/\s+/g, ' ').trim();
  } catch (e) {
    console.error('Error reading PDF ' + filePath + ':', e.message);
    return '';
  }
}

async function run() {
  const catalogPath = path.join(__dirname, '../src/services/textbookCatalog.json');
  if (!fs.existsSync(catalogPath)) {
    console.error('Catalog not found at', catalogPath);
    return;
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  console.log(`Starting text extraction for ${catalog.length} textbook files...`);

  const outDir = path.join(__dirname, '../public/textbook_texts');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  let count = 0;
  for (let i = 0; i < catalog.length; i++) {
    const item = catalog[i];
    const fullPath = path.join(__dirname, '../public/textbooks', item.fileName);
    
    if (fs.existsSync(fullPath) && item.fileName.endsWith('.pdf')) {
      const text = await processPdf(fullPath);
      if (text && text.length > 50) {
        const outPath = path.join(outDir, `${item.id}.txt`);
        fs.writeFileSync(outPath, text, 'utf8');
        item.textPath = `/textbook_texts/${item.id}.txt`;
        item.charCount = text.length;
        count++;
        console.log(`[${count}/${catalog.length}] ${item.title} -> ${text.length.toLocaleString()} chars`);
      }
    }
  }

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`🎉 SUCCESS: Extracted text for ${count} textbooks! Saved to public/textbook_texts/`);
}

run();
