// Simple in-memory response cache with TTL

import { redis } from '../config/redis.js';
import type { Request, Response, NextFunction } from 'express';

export function cacheResponse(ttlSeconds: number, keyBuilder?: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();

    const key = keyBuilder ? keyBuilder(req) : `${req.originalUrl}`;
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      console.warn('Redis cache get failed:', err);
    }

    const originalJson: Response['json'] = res.json.bind(res);
    res.json = ((body: any) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis.set(key, JSON.stringify(body), 'EX', ttlSeconds).catch((err) => {
          console.warn('Redis cache set failed:', err);
        });
      }
      return originalJson(body);
    }) as unknown as Response['json'];

    next();
  };
}

export async function clearCache(prefix?: string) {
  if (!prefix) {
    // Clear all keys (dangerous in production, use with caution)
    const keys = await redis.keys('*');
    if (keys.length) await redis.del(...keys);
    return;
  }
  const keys = await redis.keys(`${prefix}*`);
  if (keys.length) await redis.del(...keys);
}
