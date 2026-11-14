import { config } from '../config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UploadResult {
  url: string;
  provider: 'cloudinary' | 'local' | 'blob';
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.pdf',
]);

const DANGEROUS_EXTENSIONS = new Set([
  '.php',
  '.phtml',
  '.php3',
  '.php4',
  '.php5',
  '.html',
  '.htm',
  '.xhtml',
  '.exe',
  '.sh',
  '.bash',
  '.js',
  '.ts',
  '.py',
  '.rb',
  '.pl',
  '.jsp',
  '.asp',
  '.aspx',
  '.cgi',
  '.bin',
  '.bat',
  '.cmd',
]);

/**
 * Validates magic numbers (byte signatures) of uploaded binary files to prevent MIME-spoofing attacks.
 */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47
  if (mimeType === 'image/png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }

  // GIF: 47 49 46 38 ('GIF8')
  if (mimeType === 'image/gif') {
    return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
  }

  // PDF: 25 50 44 46 ('%PDF')
  if (mimeType === 'application/pdf') {
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }

  // WEBP: RIFF....WEBP
  if (mimeType === 'image/webp') {
    if (buffer.length < 12) return false;
    const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  // SVG: text check
  if (mimeType === 'image/svg+xml') {
    const textSample = buffer.slice(0, 1024).toString('utf-8').toLowerCase();
    return textSample.includes('<svg') || textSample.includes('<?xml');
  }

  return true;
}

export async function uploadMedia(file: Express.Multer.File): Promise<UploadResult> {
  // 1. MIME type validation
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new Error(`Unsupported file type: ${file.mimetype}. Allowed types: JPG, PNG, WEBP, SVG, GIF, PDF.`);
  }

  // 2. Extension validation & Path Traversal defense
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`File extension "${ext}" is not permitted.`);
  }
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    throw new Error(`Executable file extension "${ext}" is strictly blocked.`);
  }

  // 3. File size limit: 10MB
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File exceeds maximum allowed size of 10MB.');
  }

  // 4. Content signature verification (Magic Bytes)
  if (!validateMagicBytes(file.buffer, file.mimetype)) {
    throw new Error('File content signature does not match claimed format.');
  }

  // Generate cryptographically random sanitized safe name (no path traversal, no arbitrary overwrite)
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  const baseNameClean = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  const safeFilename = `${Date.now()}-${baseNameClean}-${randomSuffix}${ext}`;

  // If Cloudinary credentials are provided, upload to Cloudinary via REST API
  if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
    try {
      const base64Data = file.buffer.toString('base64');
      const dataUri = `data:${file.mimetype};base64,${base64Data}`;
      
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = 'triclinium';

      // Dynamically compute signature
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
        filename: result.public_id || safeFilename,
        size: file.size,
        mimeType: file.mimetype,
        width: result.width,
        height: result.height,
      };
    } catch (err: any) {
      console.warn('[Cloudinary upload exception, falling back to local storage]:', err.message);
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
    
    // Validate target path is strictly within uploadDir (defense against path traversal)
    const targetPath = path.join(uploadDir, safeFilename);
    const resolvedPath = path.resolve(targetPath);
    if (!resolvedPath.startsWith(uploadDir)) {
      throw new Error('Invalid upload destination path detected.');
    }

    fs.writeFileSync(resolvedPath, file.buffer);

    return {
      url: `/uploads/${safeFilename}`,
      provider: 'local',
      filename: safeFilename,
      size: file.size,
      mimeType: file.mimetype,
    };
  } catch (localErr: any) {
    // In-memory data URI fallback if filesystem writing fails
    const base64 = file.buffer.toString('base64');
    return {
      url: `data:${file.mimetype};base64,${base64}`,
      provider: 'local',
      filename: safeFilename,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
