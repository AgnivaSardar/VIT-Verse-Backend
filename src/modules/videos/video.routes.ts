// src/modules/videos/video.routes.ts
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadVideoHandler,
  getVideoByIdHandler,
  listVideosHandler,
} from './video.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// DEV: local disk storage; in prod, swap to S3 storage engine.
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

router.post(
  '/videos/upload',
  authMiddleware,
  upload.single('video'), // form-data field: "video"
  uploadVideoHandler,
);

router.get('/videos/:id', getVideoByIdHandler);
router.get('/videos', listVideosHandler);

export default router;
