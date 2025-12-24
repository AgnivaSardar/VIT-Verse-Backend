// src/modules/admin/admin.routes.ts
import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireAdminOrSuperAdmin } from '../../middlewares/admin.middleware';
import * as adminController from './admin.controller';

const router = Router();

// All admin routes require authentication and super admin role
router.use(requireAuth);
router.use(requireAdminOrSuperAdmin);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// Users management
router.post('/users/create', adminController.createAdminUser);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

// Channels management
router.get('/channels', adminController.getAllChannels);
router.patch('/channels/:id/toggle-visibility', adminController.toggleChannelVisibility);

// Videos management
router.get('/videos', adminController.getAllVideos);
router.patch('/videos/:id/toggle-visibility', adminController.toggleVideoVisibility);

// Playlists management
router.get('/playlists', adminController.getAllPlaylists);
router.patch('/playlists/:id/toggle-visibility', adminController.togglePlaylistVisibility);

export default router;
