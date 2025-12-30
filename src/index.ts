import 'reflect-metadata';
import dotenv from 'dotenv';
import https from 'https';  // ← CHANGED: https
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import prisma from './config/prisma';

dotenv.config();

import app from './app';
import { redis } from './config/redis';
import { initSocketIO } from './modules/realtime/socket.server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 5000;
const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 5443;  // ← HTTPS PORT
const HOST = process.env.HOST || '0.0.0.0';

let httpsServer: https.Server;  // ← HTTPS Server

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

    // HTTPS Server with Socket.io
    const options = {
      key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem'))
    };

    httpsServer = https.createServer(options, app);
    const io = initSocketIO(httpsServer);  // ← Socket.io on HTTPS
    console.log('✅ Socket.io ready (HTTPS)');

    httpsServer.listen(HTTPS_PORT, HOST, () => {
      console.log(`🔒 HTTPS Server: https://${HOST}:${HTTPS_PORT}`);
      console.log(`🏥 Health: https://${HOST}:${HTTPS_PORT}/health`);
      console.log(`🔗 Connection Test: https://${HOST}:${HTTPS_PORT}/api/test-connection`);
      console.log(`🚀 React Login: https://18.60.156.89:${HTTPS_PORT}/auth/login`);
      console.log(`📦 Storage Mode: ${process.env.STORAGE_TYPE || 'local'} (${process.env.NODE_ENV === 'production' ? 'production' : 'development'})`);
      console.log(`🗄️  Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'local PostgreSQL'}`);
      console.log(`📱 Modules: auth, channels, videos, tags, jobs, notifications, & more`);
      console.log(`✅ Ready for localhost:5173 frontend!`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Graceful shutdown...');
      await prisma.$disconnect().catch(console.error);
      httpsServer.close(() => process.exit(0));
    });

  } catch (error) {
    console.error('💥 Startup failed:', error);
    process.exit(1);
  }
}

bootstrap().catch(console.error);

