// src/config/redis.ts
export const initRedis = async () => {
  console.log('⚠️ Redis disabled (development mode)');
  return {
    connect: async () => {},
    on: () => {},
    get: async () => null,
    set: async () => 'OK',
    disconnect: async () => {}
  } as any;
};
