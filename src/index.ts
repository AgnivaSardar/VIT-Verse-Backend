// src/index.ts
import 'reflect-metadata';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './config/prisma';

dotenv.config();

import app from './app';
import { initRedis } from './config/redis';
import { initSocketIO } from './modules/realtime/socket.server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

let httpServer: http.Server;

async function bootstrap() {
  try {
    console.log('🚀 Starting VITVerse Backend...');

    // await initRedis();
    // console.log('✅ Redis ready');
    initRedis().then(() => console.log('✅ Redis ready (mocked)'));

    await prisma.$connect();  // ← ADD THIS
    console.log('✅ Prisma ready');

    httpServer = http.createServer(app);
    const io = initSocketIO(httpServer);
    console.log('✅ Socket.io ready');

    httpServer.listen(PORT, HOST, () => {
      console.log(`✅ Server: http://${HOST}:${PORT}`);
      console.log(`🏥 Health: http://${HOST}:${PORT}/health`);
      console.log(`📱 Modules: auth, channels, videos, tags, jobs, notifications, & more`);
    });

    // Graceful shutdown (same as before)
    process.on('SIGINT', () => {
      console.log('\n🛑 Graceful shutdown...');
      httpServer.close(() => process.exit(0));
    });

  } catch (error) {
    console.error('💥 Startup failed:', error);
    process.exit(1);
  }
}

bootstrap().catch(console.error);
