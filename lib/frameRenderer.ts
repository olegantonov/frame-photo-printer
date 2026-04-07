import sharp from 'sharp';

export interface FrameOptions {
  width: number;
  height: number;
  borderSize: number;
  backgroundColor?: string;
}

export async function applyFrame(
  imageBuffer: Buffer,
  orientation: 'portrait' | 'landscape',
  borderSize: number = 40
): Promise<Buffer> {
  const frameOptions: FrameOptions = {
    borderSize,
    backgroundColor: '#FFFFFF',
    width: orientation === 'portrait' ? 1500 : 2100,
    height: orientation === 'portrait' ? 2100 : 1500,
  };

  return sharp(imageBuffer)
    .resize(frameOptions.width - frameOptions.borderSize * 2, frameOptions.height - frameOptions.borderSize * 2, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .extend({
      top: frameOptions.borderSize,
      bottom: frameOptions.borderSize,
      left: frameOptions.borderSize,
      right: frameOptions.borderSize,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();
}

export async function detectImageOrientation(
  imageBuffer: Buffer
): Promise<'portrait' | 'landscape'> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 1;
  const height = metadata.height || 1;
  return height > width ? 'portrait' : 'landscape';
}
