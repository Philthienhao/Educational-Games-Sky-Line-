import { execSync } from 'child_process';
import fs from 'fs';

console.log("Checking available headless browser CLI tools...");
try {
  const whichChrome = execSync('which google-chrome || which chromium || which "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"', { encoding: 'utf8' });
  console.log("Chrome binary found:", whichChrome.trim());
} catch (e) {
  console.log("No default chrome path found:", e.message);
}
