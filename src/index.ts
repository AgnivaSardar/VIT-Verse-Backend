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
      } catch (err) {
        console.error('Failed to disconnect:', err);
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

