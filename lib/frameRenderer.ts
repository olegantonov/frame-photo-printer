import sharp from 'sharp';

export interface FrameOptions {
  width: number;
  height: number;
  borderSize: number;
  backgroundColor?: string;
  showId?: boolean;
  showDateTime?: boolean;
}

export interface FrameConfig {
  frame_border_size: number;
  frame_bg_color: string;
  frame_show_id: boolean;
  frame_show_datetime: boolean;
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

function createTextOverlay(photoId: string, dateTime: string, width: number, showId: boolean, showDateTime: boolean): Buffer | null {
  const parts: string[] = [];
  if (showId) parts.push(photoId);
  if (showDateTime) parts.push(dateTime);
  
  if (parts.length === 0) return null;
  
  const text = parts.join(' | ');
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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

export async function applyFrame(
  imageBuffer: Buffer,
  orientation: 'portrait' | 'landscape',
  config?: FrameConfig
): Promise<Buffer> {
  const borderSize = config?.frame_border_size ?? 40;
  const bgColor = config?.frame_bg_color ?? '#FFFFFF';
  const showId = config?.frame_show_id ?? true;
  const showDateTime = config?.frame_show_datetime ?? true;
  
  const rgb = hexToRgb(bgColor);
  
  const frameOptions: FrameOptions = {
    borderSize,
    backgroundColor: bgColor,
    width: orientation === 'portrait' ? 1500 : 2100,
    height: orientation === 'portrait' ? 2100 : 1500,
    showId,
    showDateTime,
  };

  const photoId = generatePhotoId();
  const dateTime = formatDateTime();
  const textOverlay = createTextOverlay(photoId, dateTime, frameOptions.width, showId, showDateTime);

  // Create framed image
  const framedImage = await sharp(imageBuffer)
    .resize(frameOptions.width - frameOptions.borderSize * 2, frameOptions.height - frameOptions.borderSize * 2, {
      fit: 'contain',
      background: { r: rgb.r, g: rgb.g, b: rgb.b, alpha: 1 },
    })
    .extend({
      top: frameOptions.borderSize,
      bottom: frameOptions.borderSize,
      left: frameOptions.borderSize,
      right: frameOptions.borderSize,
      background: { r: rgb.r, g: rgb.g, b: rgb.b, alpha: 1 },
    })
    .png()
    .toBuffer();

  // If no text overlay, return framed image
  if (!textOverlay) {
    return framedImage;
  }

  // Get text overlay dimensions and composite
  const textMeta = await sharp(textOverlay).metadata();
  const textWidth = textMeta.width || 150;

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
