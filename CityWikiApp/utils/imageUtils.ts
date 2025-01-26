import { ImageSourcePropType } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { requiredAssets } from '../requiredAssets';

// Helper function to resolve the asset URI at runtime
function resolveAssetPath(relativePath: string) {
  return `${FileSystem.bundleDirectory}assets/${relativePath}`;
}

export async function preloadImages() {
  // No preloading needed as we're accessing bundled assets directly
  return Promise.resolve();
}

export function getImageSource(path: string | undefined): ImageSourcePropType {
  if (!path) {
    console.warn('No image path provided');
    return { uri: resolveAssetPath('placeholder.jpg') };
  }

  // If it's a remote URL (starts with http/https), return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return { uri: path };
  }

  // For local files, decode the path and return the required asset
  const decodedPath = decodeURIComponent(path);
  return requiredAssets[decodedPath as keyof typeof requiredAssets] || { uri: resolveAssetPath('placeholder.jpg') };
} 
