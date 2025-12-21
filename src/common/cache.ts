// Simple in-memory response cache with TTL
import type { Request, Response, NextFunction } from 'express';

type CacheEntry = {
  data: any;
  expiresAt: number;
};

const cacheStore = new Map<string, CacheEntry>();

function isExpired(entry: CacheEntry) {
  return Date.now() > entry.expiresAt;
}

export function cacheResponse(ttlSeconds: number, keyBuilder?: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();

    const key = keyBuilder ? keyBuilder(req) : `${req.originalUrl}`;
    const cached = cacheStore.get(key);
    if (cached && !isExpired(cached)) {
      return res.json(cached.data);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheStore.set(key, { data: body, expiresAt: Date.now() + ttlSeconds * 1000 });
      }
      return originalJson(body);
    };

    next();
  };
}

export function clearCache(prefix?: string) {
  if (!prefix) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
}
