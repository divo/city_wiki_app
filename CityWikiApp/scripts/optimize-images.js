const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImage(filePath) {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // Skip if already optimized
    if (metadata.format === 'jpeg' && metadata.size < 500000) {
      return;
    }

    // Calculate target dimensions while maintaining aspect ratio
    const maxDimension = 1500;
    let width = metadata.width;
    let height = metadata.height;
    
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    // Optimize the image
    await image
      .resize(width, height)
      .jpeg({
        quality: 80,
        progressive: true,
      })
      .toBuffer()
      .then((buffer) => fs.writeFile(filePath, buffer));

    console.log(`Optimized: ${filePath}`);
  } catch (error) {
    console.error(`Error optimizing ${filePath}:`, error);
  }
}

async function walkDir(dir) {
  const files = await fs.readdir(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    
    if (stat.isDirectory()) {
      await walkDir(filePath);
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      await optimizeImage(filePath);
    }
  }
}

// Start optimization from assets directory
walkDir(path.join(__dirname, '../assets'))
  .then(() => console.log('Image optimization complete'))
  .catch(console.error); 