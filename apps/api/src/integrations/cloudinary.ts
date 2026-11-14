import { config } from '../config';
import fs from 'fs';
import path from 'path';

export interface UploadResult {
  url: string;
  provider: 'cloudinary' | 'local' | 'blob';
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

export async function uploadMedia(file: Express.Multer.File): Promise<UploadResult> {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'application/pdf'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(`Unsupported file type: ${file.mimetype}. Allowed types: JPG, PNG, WEBP, SVG, GIF, PDF.`);
  }

  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File exceeds maximum allowed size of 10MB');
  }

  // If Cloudinary credentials are provided, upload to Cloudinary via REST API
  if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
    try {
      const base64Data = file.buffer.toString('base64');
      const dataUri = `data:${file.mimetype};base64,${base64Data}`;
      
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = 'triclinium';

      // Dynamically compute signature
      const crypto = await import('crypto');
      const signaturePayload = `folder=${folder}&timestamp=${timestamp}${config.cloudinary.apiSecret}`;
      const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

      const formData = new URLSearchParams();
      formData.append('file', dataUri);
      formData.append('api_key', config.cloudinary.apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudinary upload failed: ${errorText}`);
      }

      const result = await response.json();
      return {
        url: result.secure_url || result.url,
        provider: 'cloudinary',
        filename: result.public_id || file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        width: result.width,
        height: result.height,
      };
    } catch (err: any) {
      console.warn('[Cloudinary upload exception, falling back]:', err.message);
    }
  }

  // Local/Dev persistent fallback: store in apps/web/public/uploads
  try {
    let uploadDir = path.resolve(process.cwd(), 'apps/web/public/uploads');
    if (!fs.existsSync(path.resolve(process.cwd(), 'apps/web')) && fs.existsSync(path.resolve(process.cwd(), '../web/public'))) {
      uploadDir = path.resolve(process.cwd(), '../web/public/uploads');
    }
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const targetPath = path.join(uploadDir, safeName);
    fs.writeFileSync(targetPath, file.buffer);

    return {
      url: `/uploads/${safeName}`,
      provider: 'local',
      filename: safeName,
      size: file.size,
      mimeType: file.mimetype,
    };
  } catch (localErr) {
    // In-memory data URI fallback
    const base64 = file.buffer.toString('base64');
    return {
      url: `data:${file.mimetype};base64,${base64}`,
      provider: 'local',
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
