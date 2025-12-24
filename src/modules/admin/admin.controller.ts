// src/modules/admin/admin.controller.ts
import { Request, Response } from 'express';
// Ensure the file './admin.service.ts' exists in the same directory as this controller.
// If the file exists but the error persists, try importing with the extension:
import * as adminService from './admin.service.ts';
import { z } from 'zod';

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: (err: any) => void) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

// ========================================
// USERS MANAGEMENT
// ========================================

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'student', 'teacher']),
  isSuperAdmin: z.boolean().optional(),
});

export const createAdminUser = asyncHandler(async (req: Request, res: Response) => {
  const data = createUserSchema.parse(req.body);
  const result = await adminService.createAdminUser(data);
  res.status(201).json(result);
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const role = req.query.role as string;

  const result = await adminService.getAllUsers({ page, limit, search, role });
  res.json(result);
});

export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await adminService.toggleUserStatus(userId);
  res.json(result);
});

// ========================================
// CHANNELS MANAGEMENT
// ========================================

export const getAllChannels = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;

  const result = await adminService.getAllChannels({ page, limit, search });
  res.json(result);
});

export const toggleChannelVisibility = asyncHandler(async (req: Request, res: Response) => {
  const channelId = req.params.id;
  const result = await adminService.toggleChannelVisibility(channelId);
  res.json(result);
});

// ========================================
// VIDEOS MANAGEMENT
// ========================================

export const getAllVideos = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;

  const result = await adminService.getAllVideos({ page, limit, search });
  res.json(result);
});

export const toggleVideoVisibility = asyncHandler(async (req: Request, res: Response) => {
  const videoId = req.params.id;
  const result = await adminService.toggleVideoVisibility(videoId);
  res.json(result);
});

// ========================================
// PLAYLISTS MANAGEMENT
// ========================================

export const getAllPlaylists = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;

  const result = await adminService.getAllPlaylists({ page, limit, search });
  res.json(result);
});

export const togglePlaylistVisibility = asyncHandler(async (req: Request, res: Response) => {
  const playlistId = req.params.id;
  const result = await adminService.togglePlaylistVisibility(playlistId);
  res.json(result);
});

// ========================================
// DASHBOARD STATS
// ========================================

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  res.json(stats);
});
