// src/index.ts
import 'reflect-metadata';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './config/prisma';

dotenv.config();

import app from './app';
import { redis } from './config/redis';
import { initSocketIO } from './modules/realtime/socket.server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

let httpServer: http.Server;
// Monitor database connection health
async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('🔴 Database health check failed:', error);
    return false;
  }
}

// Periodically check and log connection pool status
function monitorConnectionPool() {
  setInterval(async () => {
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      console.error('⚠️  Database connection unhealthy! Attempting recovery...');
      try {
        await prisma.$disconnect();
        console.log('🔄 Disconnected from database');
        // Reconnection will happen on next query due to Prisma's auto-reconnect
      } catch (err) {
        console.error('Failed to disconnect:', err);
      }
    }
  }, 30000); // Check every 30 seconds
}


async function bootstrap() {
  try {
    console.log('🚀 Starting VITVerse Backend...');

    // Redis connection is initialized on import (see config/redis.ts)
    // No need to call initRedis; redis is ready for use

    await prisma.$connect();  // ← ADD THIS
    console.log('✅ Prisma ready');

  // Start connection pool monitoring
  monitorConnectionPool();

    httpServer = http.createServer(app);
    const io = initSocketIO(httpServer);
    console.log('✅ Socket.io ready');

    httpServer.listen(PORT, HOST, () => {
      console.log(`✅ Server: http://${HOST}:${PORT}`);
      console.log(`🏥 Health: http://${HOST}:${PORT}/health`);
      console.log(`🔗 Connection Test: http://${HOST}:${PORT}/api/test-connection`);
      console.log(`📦 Storage Mode: ${process.env.STORAGE_TYPE || 'local'} (${process.env.NODE_ENV === 'production' ? 'production' : 'development'})`);
      console.log(`🗄️  Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'local PostgreSQL'}`);
      console.log(`📱 Modules: auth, channels, videos, tags, jobs, notifications, & more`);
      console.log(`🚀 Ready to accept connections from frontend!`);
    });

    // Graceful shutdown (same as before)
    process.on('SIGINT', () => {
      console.log('\n🛑 Graceful shutdown...');
        prisma.$disconnect().catch(console.error);
      httpServer.close(() => process.exit(0));
    });

  } catch (error) {
    console.error('💥 Startup failed:', error);
    process.exit(1);
  }
}

bootstrap().catch(console.error);
