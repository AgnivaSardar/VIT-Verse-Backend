// src/modules/videos/video.controller.ts
import type { Request, Response } from 'express';
import { videoService } from './video.service';
import type { CreateVideoInput } from './video.types';
import { AppError } from '../../common/errors';
import { toJSON } from '../../common/utils';
import { channelService } from '../channels/channel.service';
import fs from 'fs';

export const uploadVideoHandler = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      throw new AppError('No video file uploaded', 400);
    }

    const uploaderID = BigInt(String(req.user!.id));
    
    // Check if user has a channel
    const userChannel = await channelService.getUserChannel(uploaderID);
    if (!userChannel) {
      throw new AppError('You must create a channel before uploading videos', 403);
    }

    const storageType: 'local' | 's3' =
      process.env.STORAGE_TYPE === 's3' ? 's3' : 'local';

    const input = await videoService.parseUploadInput(
      req.body,
      storageType === 'local' ? file.path : file.filename!,
      file.originalname,
      userChannel.channelID,
    );

    // For S3, read file buffer and pass it along
    let fileBuffer: Buffer | undefined;
    if (storageType === 's3' && file.path) {
      fileBuffer = fs.readFileSync(file.path);
    }

    const video = await videoService.createVideo(
      input,
      storageType === 'local' ? file.path : file.filename!,
      file.originalname,
      storageType,
      uploaderID,
      fileBuffer,
      file.mimetype,
      file.size,
    );

    // Clean up local temp file after S3 upload
    if (storageType === 's3' && file.path) {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.warn('Failed to delete temp file:', err);
      }
    }

    res.status(201).json({
      message: 'Video uploaded successfully. Processing in background...',
      video: toJSON(video),
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      console.error('Upload video error:', err);
      res.status(500).json({ message: err.message || 'Internal server error' });
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
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      const message = err instanceof Error ? err.message : 'Failed to list videos';
      console.error('🔴 Database error in listVideosHandler:', message, err);
      res.status(500).json({ message: 'Internal server error', error: message });
    }
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
    const userID = BigInt(String(req.user!.id));
    const { page = '1', limit = '20' } = req.query;
    const videos = await videoService.getMyVideos(
      userID,
      Number(page),
      Number(limit),
    );
    res.json(videos);
  } catch (err) {
    console.error('Get my videos error:', err);
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      const message = err instanceof Error ? err.message : 'Failed to fetch your videos';
      console.error('🔴 Database error in getMyVideosHandler:', message, err);
      res.status(500).json({ message: 'Internal server error', error: message });
    }
  }
};

export const getVideoStreamUrlHandler = async (req: Request, res: Response) => {
  try {
    const vidID = BigInt(req.params.id);
    const video = await videoService.getVideoById(vidID);
    
    if (!video) {
      throw new AppError('Video not found', 404);
    }

    // Generate presigned URL for S3 videos
    const streamUrl = await videoService.getVideoStreamUrl(video);
    
    res.json({ 
      streamUrl,
      expiresIn: 3600, // 1 hour
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      console.error('Get stream URL error:', err);
      res.status(500).json({ message: 'Failed to generate stream URL' });
    }
  }
};
