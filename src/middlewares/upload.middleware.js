import multer from 'multer';
import path from 'path';
import { createError } from '../utils/apiResponse.js';
import crypto from 'crypto';
import fs from 'fs';

const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
]

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(createError("INVALID_FILE_TYPE", "Tipo de archivo no permitido"), false)
  }
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.type === 'delivery_proof'
      ? 'uploads/proofs'
      : 'uploads/documents'

    fs.mkdirSync(folder, { recursive: true })

    cb(null, folder)
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const fileName = `${crypto.randomUUID()}${extension}`;
    cb(null, fileName)
  }
})


const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024} })

export default upload
