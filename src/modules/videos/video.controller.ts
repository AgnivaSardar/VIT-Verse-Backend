// src/modules/videos/video.controller.ts
import type { Request, Response } from 'express';
import { videoService } from './video.service';
import type { UploadVideoRequestBody } from './video.types';

export const uploadVideoHandler = async (req: Request, res: Response) => {
  try {
    const file = req.file; // typed via global augmentation
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const body = req.body as UploadVideoRequestBody;
    if (!body.title || !body.channelID) {
      return res.status(400).json({ message: 'Missing title or channelID' });
    }

    const metadataInput = videoService.parseUploadBody(body);

    const storageType: 'local' | 's3' =
      process.env.STORAGE_TYPE === 's3' ? 's3' : 'local';

    const filePath =
      storageType === 'local'
        ? file.path
        : (file as any).key || file.filename;

    const video = await videoService.createVideoRecord(
      metadataInput,
      filePath,
      storageType,
    );

    return res.status(201).json({
      message: 'Video uploaded, processing started',
      video,
    });
  } catch (err) {
    console.error('uploadVideoHandler error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getVideoByIdHandler = async (req: Request, res: Response) => {
  try {
    const vidID = BigInt(req.params.id);
    const video = await videoService.getVideoById(vidID);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    return res.json(video);
  } catch (err) {
    console.error('getVideoByIdHandler error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const listVideosHandler = async (req: Request, res: Response) => {
  try {
    const { channelID, page, limit } = req.query;

    const result = await videoService.listVideos({
      channelID: channelID ? BigInt(channelID as string) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return res.json(result);
  } catch (err) {
    console.error('listVideosHandler error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
