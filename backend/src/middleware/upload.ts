import multer from 'multer';
import { AppError } from '../errors/AppError.js';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export const qrCodeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Formato inválido. Use PNG, JPEG ou WebP'));
    }
  },
});

export function getQrCodeExtension(mimetype: string): string {
  switch (mimetype) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    default:
      throw new AppError('Formato inválido. Use PNG, JPEG ou WebP');
  }
}
