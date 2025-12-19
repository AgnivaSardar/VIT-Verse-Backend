// src/app.ts
import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';

// === ALL YOUR MODULE ROUTES ===
import authRoutes from './modules/auth/auth.routes';
import channelRoutes from './modules/channels/channel.routes';
import commentRoutes from './modules/comments/comment.routes';
import imageRoutes from './modules/images/image.routes';
import jobRoutes from './modules/jobs/job.routes';
import likeRoutes from './modules/likes/like.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import playlistRoutes from './modules/playlists/playlist.routes';
import reportRoutes from './modules/reports/report.routes';
import studentRoutes from './modules/students/student.routes';
import subscriptionRoutes from './modules/subscriptions/subscription.routes';
import tagRoutes from './modules/tags/tag.routes';
import teacherRoutes from './modules/teachers/teacher.routes';
import userRoutes from './modules/users/user.routes';
import videoRoutes from './modules/videos/video.routes';
import videostatsRoutes from './modules/videostats/videostats.routes';
import viewsRoutes from './modules/views/views.routes';

// Middlewares
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// === SECURITY ===
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// === PERFORMANCE ===
app.use(compression());
app.use(cookieParser());

// === RATE LIMITING ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit for dev/testing
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
  // Bypass for automated tests when header is present
  skip: (req) => req.headers['x-bypass-rate-limit'] === '1',
});
app.use('/api/', limiter);

// === PARSERS ===
app.use(express.json({ limit: '50mb' })); // larger for video metadata
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// === LOGGING ===
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// === HEALTH CHECK ===
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// === MOUNT ALL MODULES ===
app.use('/api/auth', authRoutes);
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
