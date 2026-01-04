// src/config/redis.ts
import { Redis } from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});
redis.on('error', (err: Error) => {
  console.error('❌ Redis error:', err);
});
