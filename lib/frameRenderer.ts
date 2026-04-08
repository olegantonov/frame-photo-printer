import sharp from 'sharp';

export interface FrameOptions {
  width: number;
  height: number;
  borderSize: number;
  backgroundColor?: string;
}

function generatePhotoId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function formatDateTime(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function createTextOverlay(photoId: string, dateTime: string, width: number): Buffer {
  const text = `${photoId} | ${dateTime}`;
  const fontSize = Math.max(16, Math.floor(width / 80));
  const padding = 10;
  const textWidth = text.length * fontSize * 0.6;
  const textHeight = fontSize + padding * 2;
  
  const svg = `
    <svg width="${textWidth + padding * 2}" height="${textHeight}">
      <text 
        x="${padding}" 
        y="${fontSize + padding/2}" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}px" 
        fill="#888888"
      >${text}</text>
    </svg>
  `;
  
  return Buffer.from(svg);
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

  const photoId = generatePhotoId();
  const dateTime = formatDateTime();
  const textOverlay = createTextOverlay(photoId, dateTime, frameOptions.width);
  
  // Get text overlay dimensions
  const textMeta = await sharp(textOverlay).metadata();
  const textWidth = textMeta.width || 150;
  const textHeight = textMeta.height || 30;

  // Create framed image first
  const framedImage = await sharp(imageBuffer)
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

  // Composite text overlay on top right corner
  return sharp(framedImage)
    .composite([{
      input: textOverlay,
      top: 8,
      left: frameOptions.width - textWidth - 8,
    }])
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
