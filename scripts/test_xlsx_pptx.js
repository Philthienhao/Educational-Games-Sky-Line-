import fs from 'fs';
import * as XLSX from 'xlsx';

const testFile = './slide/bai1.pptx';
if (fs.existsSync(testFile)) {
  const buf = fs.readFileSync(testFile);
  try {
    const wb = XLSX.read(buf, { type: 'buffer' });
    console.log('XLSX read PPTX SheetNames:', wb.SheetNames);
  } catch (e) {
    console.log('XLSX error reading PPTX:', e.message);
  }
}
