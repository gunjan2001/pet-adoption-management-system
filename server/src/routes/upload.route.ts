import { Router } from 'express';
import multer from 'multer';
import { uploadHandler } from '../controllers/media.controller';

// Create multer instance for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage(),limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  } });
const router = Router();

// Route with multer middleware for parsing "file" field
router.post('/upload', upload.single('file'), uploadHandler);

export default router;
