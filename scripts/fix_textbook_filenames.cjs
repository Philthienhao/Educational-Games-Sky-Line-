const fs = require('fs');
const path = require('path');

const textbooksDir = path.join(__dirname, '../public/textbooks');
const catalogPath = path.join(__dirname, '../src/services/textbookCatalog.json');

// Read current catalog
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

/**
 * Remove Vietnamese accents and special characters to make a 100% safe ASCII filename
 */
function toSafeAsciiFileName(originalName) {
  if (!originalName) return '';

  // Separate directory path if any (e.g., SGK_lop_1/file.pdf)
  const dirName = path.dirname(originalName);
  const baseName = path.basename(originalName);
  const ext = path.extname(baseName);
  const nameWithoutExt = path.basename(baseName, ext);

  const asciiName = nameWithoutExt
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  const safeBase = `${asciiName}${ext.toLowerCase()}`;
  return dirName && dirName !== '.' ? `${dirName}/${safeBase}` : safeBase;
}

let updatedCount = 0;

catalog.forEach((item) => {
  if (!item.fileName || item.fileName.endsWith('.txt')) return;

  const oldRelativePath = item.fileName;
  const newRelativePath = toSafeAsciiFileName(oldRelativePath);

  const oldFullPath = path.join(textbooksDir, oldRelativePath);
  const newFullPath = path.join(textbooksDir, newRelativePath);

  // Check if old file exists on disk
  if (fs.existsSync(oldFullPath)) {
    if (oldFullPath !== newFullPath) {
      fs.renameSync(oldFullPath, newFullPath);
      console.log(`Renamed: "${oldRelativePath}" -> "${newRelativePath}"`);
    }
    item.fileName = newRelativePath;
    updatedCount++;
  } else {
    // If old file not found directly, check if new filename already exists
    if (fs.existsSync(newFullPath)) {
      item.fileName = newRelativePath;
      updatedCount++;
      console.log(`Already safe: "${newRelativePath}"`);
    } else {
      console.warn(`WARNING: Missing file "${oldRelativePath}"`);
    }
  }
});

// Save updated catalog
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');

console.log(`\nSuccessfully updated ${updatedCount} textbook files to 100% URL-safe ASCII paths!`);
