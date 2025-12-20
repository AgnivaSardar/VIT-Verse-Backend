// src/modules/videos/video.controller.ts
import type { Request, Response } from 'express';
import { videoService } from './video.service';
import type { CreateVideoInput } from './video.types';
import { AppError } from '../../common/errors';
import { toJSON } from '../../common/utils';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    // Remove local User interface and align Request.user type with global UserPayload
    interface Request {
      user?: UserPayload;
    }
  }
}

export const uploadVideoHandler = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      throw new AppError('No video file uploaded', 400);
    }

    const uploaderID = BigInt(req.user!.id);
    const storageType: 'local' | 's3' =
      process.env.STORAGE_TYPE === 's3' ? 's3' : 'local';

    const input = await videoService.parseUploadInput(
      req.body,
      storageType === 'local' ? file.path : file.filename!,
      file.originalname,
    );

    const video = await videoService.createVideo(
      input,
      storageType === 'local' ? file.path : file.filename!,
      file.originalname,
      storageType,
      uploaderID,
    );

    res.status(201).json({
      message: 'Video uploaded successfully. Processing in background...',
      video,
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      console.error('Upload video error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const getVideoHandler = async (req: Request, res: Response) => {
  try {
    const vidID = BigInt(req.params.id);
    const video = await videoService.getVideoById(vidID);
    if (!video) {
      throw new AppError('Video not found', 404);
    }
    res.json(video);
  } catch (err: any) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const listVideosHandler = async (req: Request, res: Response) => {
  try {
    const { channelID, tagID, page, limit, status } = req.query;
    const videos = await videoService.listVideos({
      channelID: channelID ? BigInt(channelID as string) : undefined,
      tagID: tagID ? BigInt(tagID as string) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string,
    });
    res.json(toJSON(videos));
  } catch (err) {
    console.error('List videos error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateVideoHandler = async (req: Request, res: Response) => {
  try {
    const vidID = BigInt(req.params.id);
    const data = req.body;
    const video = await videoService.updateVideo(vidID, data);
    res.json(video);
  } catch (err) {
    console.error('Update video error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyVideosHandler = async (req: Request, res: Response) => {
  try {
    const userID = BigInt(req.user!.id);
    const { page = '1', limit = '20' } = req.query;
    const videos = await videoService.getMyVideos(
      userID,
      Number(page),
      Number(limit),
    );
    res.json(videos);
  } catch (err) {
    console.error('Get my videos error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};