import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';

export interface FrameConfig {
  frame_portrait: string | null;
  frame_landscape: string | null;
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

export async function applyFrame(
  imageBuffer: Buffer,
  orientation: 'portrait' | 'landscape',
  config?: FrameConfig
): Promise<Buffer> {
  const showId = config?.frame_show_id ?? true;
  const showDateTime = config?.frame_show_datetime ?? true;
  // Select frame based on orientation
  const frameImagePath = orientation === 'portrait' 
    ? config?.frame_portrait 
    : config?.frame_landscape;
  
  // Final dimensions for 15x21cm at 100 DPI
  const frameWidth = orientation === 'portrait' ? 1500 : 2100;
  const frameHeight = orientation === 'portrait' ? 2100 : 1500;

  const photoId = generatePhotoId();
  const dateTime = formatDateTime();
  const textOverlay = createTextOverlay(photoId, dateTime, frameWidth, showId, showDateTime);

  // Check if frame image exists
  let frameBuffer: Buffer | null = null;
  if (frameImagePath) {
    try {
      const fullFramePath = path.join(process.cwd(), 'public', frameImagePath);
      frameBuffer = await fs.readFile(fullFramePath);
    } catch (error) {
      console.error('Failed to load frame image:', error);
    }
  }

  if (frameBuffer) {
    // PNG Frame overlay mode: photo behind, frame on top
    // Get frame dimensions
    const frameMeta = await sharp(frameBuffer).metadata();
    const actualFrameWidth = frameMeta.width || frameWidth;
    const actualFrameHeight = frameMeta.height || frameHeight;

    // Resize photo to fit within frame (with some padding for the frame border)
    const paddingPercent = 0.05; // 5% padding on each side for frame border
    const photoWidth = Math.floor(actualFrameWidth * (1 - paddingPercent * 2));
    const photoHeight = Math.floor(actualFrameHeight * (1 - paddingPercent * 2));

    const resizedPhoto = await sharp(imageBuffer)
      .resize(photoWidth, photoHeight, { fit: 'cover' })
      .toBuffer();

    // Create base canvas with white background
    let result = await sharp({
      create: {
        width: actualFrameWidth,
        height: actualFrameHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
      .composite([
        // Photo centered behind frame
        {
          input: resizedPhoto,
          gravity: 'center'
        },
        // Frame overlay on top
        {
          input: frameBuffer,
          gravity: 'center'
        }
      ])
      .png()
      .toBuffer();

    // Add text overlay if needed
    if (textOverlay) {
      const textMeta = await sharp(textOverlay).metadata();
      const textWidth = textMeta.width || 150;
      
      result = await sharp(result)
        .composite([{
          input: textOverlay,
          top: 8,
          left: actualFrameWidth - textWidth - 8,
        }])
        .png()
        .toBuffer();
    }

    return result;
  } else {
    // Fallback: simple white border mode
    const borderSize = 40;
    
    const framedImage = await sharp(imageBuffer)
      .resize(frameWidth - borderSize * 2, frameHeight - borderSize * 2, {
        fit: 'cover',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .extend({
        top: borderSize,
        bottom: borderSize,
        left: borderSize,
        right: borderSize,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer();

    if (!textOverlay) {
      return framedImage;
    }

    const textMeta = await sharp(textOverlay).metadata();
    const textWidth = textMeta.width || 150;

    return sharp(framedImage)
      .composite([{
        input: textOverlay,
        top: 8,
        left: frameWidth - textWidth - 8,
      }])
      .png()
      .toBuffer();
  }
}

export async function detectImageOrientation(
  imageBuffer: Buffer
): Promise<'portrait' | 'landscape'> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 1;
  const height = metadata.height || 1;
  return height > width ? 'portrait' : 'landscape';
}
