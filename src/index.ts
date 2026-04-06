import 'reflect-metadata';
import dotenv from 'dotenv';
import http from 'http';
import prisma from './config/prisma.js';

dotenv.config();

import app from './app.js';
import { initSocketIO } from './modules/realtime/socket.server.js';

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
let server: http.Server;
let consecutiveDbHealthFailures = 0;

// Monitor database connection health
async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    consecutiveDbHealthFailures = 0;
    return true;
  } catch (error) {
    console.error('🔴 Database health check failed:', error);
    consecutiveDbHealthFailures += 1;
    return false;
  }
}

// Periodically check and log connection pool status
function monitorConnectionPool() {
  setInterval(async () => {
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      // Supabase poolers can close connections during maintenance; avoid forcing disconnect on first failure.
      if (consecutiveDbHealthFailures >= 3) {
        console.error(`⚠️  Database unhealthy for ${consecutiveDbHealthFailures} checks. Attempting reconnect...`);
        try {
          await prisma.$connect();
          console.log('🔄 Prisma reconnect attempt completed');
        } catch (err) {
          console.error('Prisma reconnect attempt failed:', err);
        }
      } else {
        console.warn(`⚠️  Transient DB health failure (${consecutiveDbHealthFailures}/3). Will retry.`);
      }
    }
  }, 30000);
}

async function bootstrap() {
  try {
    console.log('🚀 Starting VITVerse Backend...');

    await prisma.$connect();
    console.log('✅ Prisma ready');

    // Start connection pool monitoring
    monitorConnectionPool();

    server = http.createServer(app);
    const io = initSocketIO(server);
    console.log('✅ Socket.io ready (HTTP behind reverse proxy)');

    server.listen(PORT, HOST, () => {
      console.log(`🚀 Backend running on http://${HOST}:${PORT}`);
      console.log(`🏥 Health: http://${HOST}:${PORT}/health`);
      console.log(`🔗 Connection Test: http://${HOST}:${PORT}/api/test-connection`);
      console.log(`📦 Storage Mode: ${process.env.STORAGE_TYPE || 'local'} (${process.env.NODE_ENV === 'production' ? 'production' : 'development'})`);
      console.log(`🗄️  Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'local PostgreSQL'}`);
      console.log(`📱 Modules: auth, channels, videos, tags, jobs, notifications, & more`);
      console.log('🔒 SSL termination handled by reverse proxy (NGINX)');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Graceful shutdown...');
      await prisma.$disconnect().catch(console.error);
      server.close(() => process.exit(0));
    });

  } catch (error) {
    console.error('💥 Startup failed:', error);
    process.exit(1);
  }
}

bootstrap().catch(console.error);

