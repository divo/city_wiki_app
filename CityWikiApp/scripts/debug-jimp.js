const fs = require('fs');
const path = require('path');

// Path to jpeg-js decoder
const decoderPath = path.join(__dirname, '../node_modules/jpeg-js/lib/decoder.js');

// Read the original file
const originalCode = fs.readFileSync(decoderPath, 'utf8');

// Add logging in requestMemoryAllocation and decode function
const patchedCode = originalCode
  .replace(
    'function requestMemoryAllocation(increaseAmount = 0) {',
    `function requestMemoryAllocation(increaseAmount = 0) {
      console.log('[DEBUG] Memory allocation requested:', Math.ceil(increaseAmount / 1024 / 1024), 'MB, Total:', Math.ceil((totalBytesAllocated + increaseAmount) / 1024 / 1024), 'MB');`
  )
  .replace(
    'var decoder = new JpegImage();',
    `console.log('[DEBUG] Decoding image, size:', Math.ceil(arr.length / 1024), 'KB');
    var decoder = new JpegImage();`
  );

// Write the patched file
fs.writeFileSync(decoderPath, patchedCode);

console.log('Patched jpeg-js decoder with debug logging'); 