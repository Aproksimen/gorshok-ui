import { JPEG_QUALITY, MAX_IMAGE_DIMENSION } from '../constants';

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export function getResizedDimensions(width, height, maxDim) {
  if (width <= maxDim && height <= maxDim) {
    return { width, height };
  }
  const ratio = Math.min(maxDim / width, maxDim / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

export async function fileToJpegDataUrl(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const { width, height } = getResizedDimensions(
      img.naturalWidth,
      img.naturalHeight,
      MAX_IMAGE_DIMENSION
    );
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(url);
  }
}
