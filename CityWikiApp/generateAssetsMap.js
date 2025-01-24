const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.resolve(__dirname, 'assets'); // Absolute path to the assets folder
const OUTPUT_FILE = path.resolve(__dirname, 'assetsMap.js'); // Absolute path to the output file

function walkDir(dir, assetMap = {}) {
  const entries = fs.readdirSync(dir);

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath, assetMap); // Recursively walk subdirectories
    } else {
      const relativePathForRequire = `./${path.relative(__dirname, fullPath).replace(/\\/g, '/')}`; // Path for require
      const key = path.relative(ASSETS_DIR, fullPath).replace(/\\/g, '/'); // Key relative to assets root
      assetMap[key] = relativePathForRequire; // Map key to require path
    }
  });

  return assetMap;
}

function generateAssetsMap() {
  const assetMap = walkDir(ASSETS_DIR);

  const fileContent = `export const assets = {\n${Object.entries(assetMap)
    .map(([key, value]) => `  '${key}': require('${value}')`)
    .join(',\n')}\n};`;

  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8');
  console.log(`Assets map generated at ${OUTPUT_FILE}`);
}

generateAssetsMap();
