import fs from 'fs';
import path from 'path';

console.log("Checking sample slides in ./slide...");
const slideDir = './slide';
if (fs.existsSync(slideDir)) {
  const files = fs.readdirSync(slideDir).filter(f => f.endsWith('.pptx'));
  console.log(`Found ${files.length} PPTX files:`, files.slice(0, 5));
}
