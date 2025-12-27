import { Request, Response } from 'express';
import { redis } from '../../config/redis';
import { AppError } from '../../common/errors';

// GET /api/videos/progress/:uploadId
export const getVideoUploadProgressHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { uploadId } = req.params;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    if (!uploadId) {
      throw new AppError('Missing uploadId', 400);
    }
    // Compose a Redis key that is unique per user and upload
    const redisKey = `video:progress:${userId}:${uploadId}`;
    const progress = await redis.get(redisKey);
    if (!progress) {
      return res.status(404).json({ progress: 0, status: 'not_found' });
    }
    // Progress should be a JSON string: { percent: number, status: string, ... }
    let progressData;
    try {
      progressData = JSON.parse(progress);
    } catch {
      progressData = { percent: Number(progress) || 0, status: 'processing' };
    }
    res.json(progressData);
  } catch (err: any) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
