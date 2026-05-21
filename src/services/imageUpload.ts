const MAX_IMAGE_SIDE = 1100;
const JPEG_QUALITY = 0.82;

export async function imageFileToDataUrl(file: File, options?: { maxSide?: number; quality?: number }): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file.');
  }

  const bitmap = await createImageBitmap(file);
  const maxSide = options?.maxSide ?? MAX_IMAGE_SIDE;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Could not process that image.');
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', options?.quality ?? JPEG_QUALITY);
}
