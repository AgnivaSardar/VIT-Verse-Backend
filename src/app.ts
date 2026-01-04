// src/app.ts
import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import hpp from 'hpp';
import { requireSignedRequests } from './middlewares/signature.middleware.js';

// === ALL YOUR MODULE ROUTES ===
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import channelRoutes from './modules/channels/channel.routes.js';
import commentRoutes from './modules/comments/comment.routes.js';
import imageRoutes from './modules/images/image.routes.js';
import jobRoutes from './modules/jobs/job.routes.js';
import likeRoutes from './modules/likes/like.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import playlistRoutes from './modules/playlists/playlist.routes.js';
import reportRoutes from './modules/reports/report.routes.js';
import studentRoutes from './modules/students/student.routes.js';
import subscriptionRoutes from './modules/subscriptions/subscription.routes.js';
import tagRoutes from './modules/tags/tag.routes.js';
import teacherRoutes from './modules/teachers/teacher.routes.js';
import userRoutes from './modules/users/user.routes.js';
import videoRoutes from './modules/videos/video.routes.js';
import videostatsRoutes from './modules/videostats/videostats.routes.js';
import viewsRoutes from './modules/views/views.routes.js';

// Middlewares
import { errorHandler } from './middlewares/error.middleware.js';
import { sanitizeMiddleware } from './common/sanitize.js';

const app: Application = express();

// Trust reverse proxy (needed for correct req.secure and IP when behind CDN/Proxy)
app.set('trust proxy', 1);

// === SECURITY ===
// Relax cross origin resource policy so thumbnails/videos served from /uploads can be loaded by the frontend.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
}));

// Enforce HTTPS in production (reject plain HTTP)
if (process.env.NODE_ENV === 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next();
    return res.status(400).json({ error: 'HTTPS required' });
  });
}

const allowedOrigins = process.env.CLIENT_ORIGIN?.split(',') || ['https://18.60.156.89', 'http://18.60.156.89', 'http://localhost:3000', 'https://localhost:3000', '*'];
console.log('🔐 CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-bypass-rate-limit', 'Cache-Control', 'Pragma'],
  credentials: true,
  maxAge: 600,
}));

// Note: app.use(cors(...)) handles preflight automatically in Express 5

// === PERFORMANCE ===
app.use(compression());
app.use(cookieParser());

// === RATE LIMITING ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Very high for dev/testing
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
  // Bypass for local/dev and explicit header
  skip: (req) => {
    const bypassHeader = req.headers['x-bypass-rate-limit'] === '1';
    const isLocal = req.ip === '::1' || req.ip === '127.0.0.1' || req.hostname === 'localhost';
    const isDev = process.env.NODE_ENV === 'development';
    return bypassHeader || isLocal || isDev;
  },
});
app.use('/api/', limiter);

// === PARSERS ===
app.use(express.json({ limit: '50mb' })); // larger for video metadata
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// === SECURITY: SANITIZE RESPONSES ===
// Remove sensitive fields from all API responses
app.use('/api/', sanitizeMiddleware);

// === HTTP PARAMETER POLLUTION PROTECTION ===
app.use(hpp({}));

// === OPTIONAL: HMAC SIGNED REQUESTS ===
if (process.env.REQUIRE_API_SIGNING === 'true') {
  const secret = process.env.API_SIGNING_SECRET;
  if (!secret) {
    console.warn('REQUIRE_API_SIGNING=true but API_SIGNING_SECRET is not set. Signed requests disabled.');
  } else {
    app.use('/api', requireSignedRequests(secret));
    console.log('🔒 API request signing enabled for /api');
  }
}

// === STATIC FILES - Serve uploaded videos ===
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, _path, stat) => {
    const originHeader = res.req?.headers.origin;
    const matchedOrigin = originHeader && allowedOrigins.includes(originHeader) ? originHeader : '*';
    res.set('Access-Control-Allow-Origin', matchedOrigin);
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
    res.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
    res.set('Accept-Ranges', 'bytes');
    res.set('Cache-Control', 'public, max-age=31536000');
    if (stat && stat.size) {
      res.set('Content-Length', stat.size.toString());
    }
  }
}));
console.log('📁 Serving uploads from:', uploadsPath);

// === LOGGING & TIMING ===
import { requestLogger } from './middlewares/requestLogger.middleware.js';
app.use(requestLogger);

// === HEALTH CHECK ===
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// === CONNECTION TEST ENDPOINT ===
app.get('/api/test-connection', (req: Request, res: Response) => {
  console.log('✅ Frontend connected successfully to backend!');
  res.status(200).json({
    message: 'Connection successful!',
    environment: process.env.NODE_ENV || 'development',
    storageType: process.env.STORAGE_TYPE || 'local',
    timestamp: new Date().toISOString()
  });
});

// === MOUNT ALL MODULES ===
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/videostats', videostatsRoutes);
app.use('/api/views', viewsRoutes);

// realtime doesn't need routes (Socket.io handles it)

// === 404 HANDLER ===
app.use('/', (req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// === GLOBAL ERROR HANDLER ===
app.use(errorHandler);

export default app;
