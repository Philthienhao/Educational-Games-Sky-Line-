const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

function cleanTextbookText(text) {
  if (!text) return '';
  return text
    // 1. Remove '-- X of Y --' and '-- X / Y --' and '-- X --' page number markers
    .replace(/--\s*\d+\s*(of|\/)\s*\d+\s*--/gi, ' ')
    .replace(/--\s*\d+\s*--/g, ' ')
    .replace(/\b\d+\s*of\s*\d+\b/gi, ' ')
    .replace(/\bTrang\s*\d+(\s*\/\s*\d+)?\b/gi, ' ')
    .replace(/\bPage\s*\d+(\s*of\s*\d+)?\b/gi, ' ')
    .replace(/--- Trang \d+ ---/gi, ' ')
    // 2. Remove repetitive PDF element headers & Publisher boilerplate
    .replace(/NHÀ XUẤT BẢN GIÁO DỤC VIỆT NAM/gi, ' ')
    .replace(/KẾT NỐI TRI THỨC VỚI CUỘC SỐNG/gi, ' ')
    .replace(/ISBN\s*[\d\-]+/gi, ' ')
    // 3. Remove excess symbols, repeated dashes & non-educational noise
    .replace(/[-_]{3,}/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

async function run() {
  const outDir = path.join(__dirname, '../public/textbook_texts');
  if (!fs.existsSync(outDir)) {
    console.error('outDir not found');
    return;
  }

  const files = fs.readdirSync(outDir);
  console.log(`Cleaning page header/footer noise from ${files.length} text files...`);

  let count = 0;
  for (const file of files) {
    if (file.endsWith('.txt')) {
      const filePath = path.join(outDir, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const cleaned = cleanTextbookText(raw);
      fs.writeFileSync(filePath, cleaned, 'utf8');
      count++;
    }
  }

  console.log(`🎉 SUCCESS: Cleaned noise from ${count} text files in public/textbook_texts/`);
}

run();
