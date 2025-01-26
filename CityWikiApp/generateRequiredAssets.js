const fs = require('fs');
const path = require('path');

// Path to your asset manifest
const manifestPath = path.join(__dirname, 'assetsConfig.json');

// Path where the generated JS file will be saved
const outputPath = path.join(__dirname, 'requiredAssets.js');

// Read and parse the asset manifest
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Ensure the manifest has the correct structure
if (!manifest.assets || !Array.isArray(manifest.assets)) {
  throw new Error('Invalid assetsConfig.json: Expected an "assets" key with an array of file paths.');
}

// Generate the required assets JS content
const generateRequiredAssets = (assets) => {
  const requiredAssets = assets
    .filter((filePath) => !filePath.endsWith('.DS_Store')) // Filter out unwanted files
    .map((filePath) => {
      const key = filePath.replace('assets/', '');
      return `'${key}': require('./${filePath}')`;
    });

  return `export const requiredAssets = {\n  ${requiredAssets.join(',\n  ')}\n};\n`;
};

// Generate the JS content
const content = generateRequiredAssets(manifest.assets);

// Write the generated JS file
fs.writeFileSync(outputPath, content, 'utf8');

console.log(`Generated requiredAssets.js with ${manifest.assets.length} assets.`);
