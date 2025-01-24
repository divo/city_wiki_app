const fs = require('fs');
const path = require('path');

// Configuration
const ASSETS_DIR = './assets'; // Directory to scan for assets
const OUTPUT_FILE = './assetsConfig.json'; // Path to the output JSON file

// Function to walk through the directory and collect asset paths
function walkDir(dir, assetPaths = []) {
  const entries = fs.readdirSync(dir);

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath, assetPaths); // Recursively walk subdirectories
    } else {
      assetPaths.push(fullPath.replace(/\\/g, '/')); // Normalize path for cross-platform compatibility
    }
  });

  return assetPaths;
}

// Generate assetsConfig.json
function generateAssetsConfig() {
  const assets = walkDir(ASSETS_DIR);

  // Create the JSON structure
  const assetsConfig = {
    assets,
  };

  // Write to the output file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(assetsConfig, null, 2), 'utf8');
  console.log(`Assets config generated at ${OUTPUT_FILE}`);
}

generateAssetsConfig();
