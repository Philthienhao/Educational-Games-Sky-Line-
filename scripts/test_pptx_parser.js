import fs from 'fs';
import path from 'path';

function extractTextFromPPTXBuffer(buffer) {
  // Simple XML tag matcher for PPTX slides text
  const str = buffer.toString('utf8', 0, buffer.length);
  // Match <a:t...>text</a:t>
  const matches = str.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
  const text = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(t => t.length > 0).join(' ');
  return text;
}

const testFile = './slide/bai1.pptx';
if (fs.existsSync(testFile)) {
  const buf = fs.readFileSync(testFile);
  const text = extractTextFromPPTXBuffer(buf);
  console.log(`Extracted ${text.length} characters from ${testFile}`);
  console.log('Sample text:', text.slice(0, 300));
}
