import { redis } from '../../config/redis.js';

/**
 * Set video processing progress in Redis for a specific user/upload.
 * @param userId string | number
 * @param uploadId string
 * @param progress { percent: number, status: string, [key: string]: any }
 * @param ttlSeconds number (optional, default 600)
 */
export async function setVideoProcessingProgress(userId: string | number, uploadId: string, progress: { percent: number, status: string, [key: string]: any }, ttlSeconds = 600) {
  const redisKey = `video:progress:${userId}:${uploadId}`;
  await redis.set(redisKey, JSON.stringify(progress), 'EX', ttlSeconds);
}

/**
 * Remove video processing progress from Redis (cleanup after done).
 */
export async function clearVideoProcessingProgress(userId: string | number, uploadId: string) {
  const redisKey = `video:progress:${userId}:${uploadId}`;
  await redis.del(redisKey);
}
