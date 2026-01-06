// src/modules/videos/video.controller.ts
import type { Request, Response } from 'express';
import { videoService } from './video.service.js';
import type { CreateVideoInput } from './video.types.js';
import { AppError } from '../../common/errors.js';
import { toJSON } from '../../common/utils.js';
import { sanitizeVideoForPublic } from '../../common/sanitize.js';
import { channelService } from '../channels/channel.service.js';
import { getS3PublicUrl, isS3Configured, deleteFromS3 } from '../../config/s3.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import fs from 'fs';
import path from 'path';
import { compressAndScaleVideo } from './video.compress.js';
import { videoCompressionConfig } from '../../config/videoCompression.js';

// Video handlers moved/merged during implementation

type UploadingRequest = AuthRequest & { uploadCleanupPaths?: string[] };

const cleanupLocalUploadFiles = (req: UploadingRequest, extraPaths: Array<string | null | undefined> = []) => {
  try {
    const files: any = (req as any).files || {};
    const candidates = [
      ...(files.video || []),
      ...(files.thumbnail || []),
    ];
    if ((req as any).file) {
      candidates.push((req as any).file);
    }

    const paths = [
      ...(req.uploadCleanupPaths || []),
      ...candidates.map((f: any) => f?.path),
      ...extraPaths,
    ].filter((p): p is string => typeof p === 'string' && !!p);

    paths.forEach((p) => {
      try {
        if (fs.existsSync(p)) {
          fs.unlinkSync(p);
        }
      } catch (err) {
        console.warn('Failed to delete temp upload file', p, err);
      }
    });
  } catch (err) {
    console.warn('Temp upload cleanup error', err);
  }
};

export const deleteVideoHandler = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam) throw new AppError('Video ID is required', 400);
    let video;

    // Try finding by publicID first
    video = await videoService.getVideoByPublicId(idParam);

    // Fallback to numeric ID for legacy support
    if (!video && /^\d+$/.test(idParam)) {
      video = await videoService.getVideoById(BigInt(idParam));
    }

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    const vidID = video.vidID;
    const userID = BigInt(String(req.user!.id));

    const ownerID = (video as any).channel?.userID;
    if (!ownerID || BigInt(ownerID) !== userID) {
      throw new AppError('You are not allowed to delete this video', 403);
    }

    await videoService.deleteVideo(vidID);
    res.status(204).send();
  } catch (err: any) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      console.error('Delete video error:', err);
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  }
};

const ensureAbsoluteUrl = (url: string, baseUrl: string) => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${baseUrl}/${url.replace(/^\//, '')}`;
};

const decorateVideoMedia = (video: any, baseUrl: string) => {
  // Detect if video is on S3 (check if s3Bucket is set or key starts with videos/)
  const isS3Video = video.s3Bucket || (video.s3KeyOriginal && video.s3KeyOriginal.startsWith('videos/'));

  // Handle S3/CloudFront playback URLs
  if (isS3Video && video.s3KeyOriginal) {
    video.playbackURL = getS3PublicUrl(video.s3KeyOriginal);
  } else if (video.s3KeyOriginal && !video.playbackURL) {
    // Local storage fallback
    let filePath = video.s3KeyOriginal;
    if (filePath.includes('\\') || filePath.includes('/')) {
      const parts = filePath.split(/[\\/]/);
      const filename = parts[parts.length - 1];
      filePath = `uploads/${filename}`;
    }
    video.playbackURL = `${baseUrl}/${filePath}`;
  }

  // images normalization and thumbnail fallback
  if (Array.isArray(video.images)) {
    video.images = video.images.map((img: any) => {
      // If image URL is already absolute, use it
      if (img.imgURL && (img.imgURL.startsWith('http://') || img.imgURL.startsWith('https://'))) {
        return img;
      }
      // If image has s3Key or looks like S3 path, use CloudFront
      const isS3Image = img.s3Key || (img.imgURL && img.imgURL.startsWith('thumbnails/'));
      if (isS3Image && (img.s3Key || img.imgURL)) {
        return {
          ...img,
          imgURL: getS3PublicUrl(img.s3Key || img.imgURL),
        };
      }
      // Local storage
      return {
        ...img,
        imgURL: ensureAbsoluteUrl(img.imgURL, baseUrl),
      };
    });
    if (!video.thumbnail && video.images.length > 0) {
      video.thumbnail = video.images[0].imgURL;
    }
  }

  // normalize thumbnail to absolute URL
  if (video.thumbnail) {
    // If thumbnail starts with thumbnails/, it's on S3
    if (video.thumbnail.startsWith('thumbnails/')) {
      video.thumbnail = getS3PublicUrl(video.thumbnail);
    } else {
      video.thumbnail = ensureAbsoluteUrl(video.thumbnail, baseUrl);
    }
  }

  // flatten stats for frontend cards
  if (video.stats) {
    if (typeof video.stats.viewsCount !== 'undefined') {
      video.views = Number(video.stats.viewsCount);
    }
    if (typeof video.stats.likesCount !== 'undefined') {
      video.likes = Number(video.stats.likesCount);
    }
  }

  return video;
};

// Compress and scale uploaded video before storage
export const uploadVideoHandler = async (req: AuthRequest, res: Response) => {
  const uploadReq = req as UploadingRequest;
  const file = (req as any).files?.video?.[0] || req.file;
  const thumbFile = (req as any).files?.thumbnail?.[0];

  let tempCompressedPath: string | null = null;
  let videoFilePath: string = '';
  let shouldCleanupTempFile = false;
  let processedFilePath = '';
  let processedFileBuffer: Buffer | undefined = undefined;
  let processedFileSize = 0;
  let processedMimeType = '';
  let createdVideo: any = null;
  let uploadedS3Key: string | null = null;
  const storageType: 'local' | 's3' = process.env.STORAGE_TYPE === 's3' ? 's3' : 'local';

  const cleanupOnFailure = async () => {
    cleanupLocalUploadFiles(uploadReq, [tempCompressedPath, videoFilePath]);
    if (storageType === 's3' && uploadedS3Key) {
      try {
        await deleteFromS3(uploadedS3Key);
      } catch (err) {
        console.warn('S3 cleanup failed for canceled upload', err);
      }
    }
    if (createdVideo?.vidID) {
      try {
        await videoService.deleteVideo(BigInt(createdVideo.vidID));
      } catch (err) {
        console.warn('Failed to remove partial video record', err);
      }
    }
  };

  try {
    if (!file) {
      throw new AppError('No video file uploaded', 400);
    }

    const uploaderID = BigInt(String(req.user!.id));

    // --- Video Compression/Scaling ---
    // Accept compression settings from request body, fallback to config defaults
    const {
      maxWidth,
      maxHeight,
      videoBitrate,
      crf,
      preset,
    } = req.body || {};

    processedFilePath = file.path;
    processedFileSize = file.size;
    processedMimeType = file.mimetype;

    try {
      const ext = path.extname(file.originalname) || '.mp4';
      const tempDir = path.join(process.cwd(), 'uploads', 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      tempCompressedPath = path.join(tempDir, `compressed-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
      await compressAndScaleVideo(file.path, tempCompressedPath, {
        maxWidth: maxWidth ? Number(maxWidth) : videoCompressionConfig.maxWidth,
        maxHeight: maxHeight ? Number(maxHeight) : videoCompressionConfig.maxHeight,
        videoBitrate: videoBitrate || videoCompressionConfig.videoBitrate,
        crf: crf ? Number(crf) : videoCompressionConfig.crf,
        preset: preset || videoCompressionConfig.preset,
      });
      if (fs.existsSync(tempCompressedPath)) {
        processedFilePath = tempCompressedPath;
        processedFileBuffer = fs.readFileSync(tempCompressedPath);
        processedFileSize = processedFileBuffer.length;
        processedMimeType = 'video/mp4';
      }
    } catch (err) {
      console.warn('Video compression failed, using original file', err);
      processedFilePath = file.path;
      processedFileBuffer = undefined;
      processedFileSize = file.size;
      processedMimeType = file.mimetype;
    }

    // Check if user has a channel
    const userChannel = await channelService.getUserChannel(uploaderID);
    if (!userChannel) {
      throw new AppError('You must create a channel before uploading videos', 403);
    }

    const input = await videoService.parseUploadInput(
      req.body,
      storageType === 'local' ? processedFilePath : file.filename!,
      file.originalname,
      userChannel.channelID,
    );

    // For S3, use processed buffer; for local, use processed path
    let fileBuffer: Buffer | undefined = undefined;
    if (storageType === 's3' && processedFilePath) {
      fileBuffer = processedFileBuffer || fs.readFileSync(processedFilePath);
    }

    const video = await videoService.createVideo(
      input,
      storageType === 'local' ? processedFilePath : file.filename!,
      file.originalname,
      storageType,
      uploaderID,
      fileBuffer,
      processedMimeType,
      processedFileSize,
    );

    if (!video) {
      throw new AppError('Failed to create video', 500);
    }

    createdVideo = video;
    uploadedS3Key = storageType === 's3' ? video.s3KeyOriginal || null : null;

    // Post-process: compute duration & generate thumbnail if missing
    const storageMode: 'local' | 's3' = process.env.STORAGE_TYPE === 's3' ? 's3' : 'local';

    videoFilePath = file.path; // Local path for processing
    shouldCleanupTempFile = false;

    // If video is on S3, download it temporarily for processing
    if (storageType === 's3' && video.s3KeyOriginal) {
      try {
        console.log('📥 Downloading video from S3 for processing...');
        const { downloadFromS3 } = await import('../../config/s3.js');
        const videoBuffer = await downloadFromS3(video.s3KeyOriginal);

        // Save to temp location
        const tempDir = path.join(process.cwd(), 'uploads', 'temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        videoFilePath = path.join(tempDir, `temp-${video.vidID}-${Date.now()}.${file.originalname.split('.').pop()}`);
        fs.writeFileSync(videoFilePath, videoBuffer);
        shouldCleanupTempFile = true;
        console.log('✅ Video downloaded for processing');
      } catch (err) {
        console.error('❌ Failed to download video from S3:', err);
        // Continue without processing
        videoFilePath = '';
      }
    }

    if (videoFilePath && fs.existsSync(videoFilePath)) {
      // Duration
      const duration = await videoService.computeDurationSeconds(videoFilePath);
      if (duration && duration > 0) {
        try {
          await videoService.updateVideo(BigInt(video.vidID), { title: video.title, duration } as any);
          console.log(`✅ Duration computed: ${duration}s`);
        } catch (err) {
          console.warn('Failed to persist duration', err);
        }
      } else {
        console.warn('Duration not computed (ffprobe missing or unreadable file)', videoFilePath);
      }

      // Thumbnails: use custom if provided; else generate from frame
      const thumbDir = path.join(process.cwd(), 'uploads', 'thumbnails');
      let thumbUrl: string | null = null;

      if (thumbFile?.path) {
        // Upload custom thumbnail to S3
        if (storageMode === 's3') {
          thumbUrl = await videoService.uploadThumbnailToS3(thumbFile.path, BigInt(video.vidID), uploaderID);
        } else {
          const filename = path.basename(thumbFile.path);
          thumbUrl = `uploads/thumbnails/${filename}`;
        }
      } else {
        // Generate thumbnail from video
        const generated = await videoService.generateThumbnailFromVideo(videoFilePath, thumbDir);
        if (generated) {
          if (storageMode === 's3') {
            thumbUrl = await videoService.uploadThumbnailToS3(generated.fullPath, BigInt(video.vidID), uploaderID);
          } else {
            thumbUrl = `uploads/thumbnails/${generated.fileName}`;
          }
        } else {
          console.warn('Thumbnail generation failed (ffmpeg missing?) for', videoFilePath);
        }
      }

      if (thumbUrl) {
        await videoService.saveThumbnailRecord(BigInt(video.vidID), thumbUrl);
        console.log(`✅ Thumbnail saved: ${thumbUrl}`);
      } else {
        console.warn('No thumbnail saved for video', video.vidID);
      }
    }


    // Clean up temp files
    if (shouldCleanupTempFile && videoFilePath) {
      try {
        fs.unlinkSync(videoFilePath);
        console.log('🧹 Cleaned up temp video file');
      } catch (err) {
        console.warn('Failed to delete temp video file:', err);
      }
    }
    // Clean up compressed temp file
    if (tempCompressedPath && fs.existsSync(tempCompressedPath)) {
      try {
        fs.unlinkSync(tempCompressedPath);
        console.log('🧹 Cleaned up compressed temp video file');
      } catch (err) {
        console.warn('Failed to delete compressed temp video file:', err);
      }
    }
    if (storageType === 's3' && file.path) {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.warn('Failed to delete upload temp file:', err);
      }
    }

    res.status(201).json({
      message: 'Video uploaded successfully. Processing in background...',
      // Return only a sanitized public view by default
      video: toJSON(sanitizeVideoForPublic(decorateVideoMedia(video as any, process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`))),
    });
  } catch (err: any) {
    await cleanupOnFailure();
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
    const idParam = req.params.id;
    if (!idParam) throw new AppError('Video ID is required', 400);
    let video;

    // Try finding by publicID first
    video = await videoService.getVideoByPublicId(idParam);

    // Fallback to numeric ID for legacy support
    if (!video && /^\d+$/.test(idParam)) {
      video = await videoService.getVideoById(BigInt(idParam));
    }

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    const videoData = decorateVideoMedia(video as any, baseUrl);
    // Sanitize before sending publicly
    res.json(toJSON(sanitizeVideoForPublic(videoData)));
  } catch (err: any) {
    console.error('❌ Get video error:', err);
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Internal server error', error: err.message });
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

    const baseUrl = process.env.BACKEND_URL || process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const videosWithUrls = videos.map((video: any) => {
      const dec = decorateVideoMedia(video, baseUrl);
      return sanitizeVideoForPublic(dec);
    });
    res.json(toJSON(videosWithUrls));
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

export const searchVideosByTitleHandler = async (req: Request, res: Response) => {
  try {
    const { q, limit } = req.query;
    const query = String(q || '').trim();
    const maxLimit = Math.min(Number(limit) || 10, 20);

    if (!query) {
      return res.json(toJSON([]));
    }

    const videos = await videoService.searchByTitle(query, maxLimit);

    // Generate playback URLs and absolute thumbnails for local development
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    const videosWithUrls = videos.map((video: any) => {
      const dec = decorateVideoMedia(video, baseUrl);
      return sanitizeVideoForPublic(dec);
    });

    res.json(toJSON(videosWithUrls));
  } catch (err: any) {
    console.error('Search videos error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const updateVideoHandler = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam) throw new AppError('Video ID is required', 400);
    let video_initial;

    // Try finding by publicID first
    video_initial = await videoService.getVideoByPublicId(idParam);

    // Fallback to numeric ID for legacy support
    if (!video_initial && /^\d+$/.test(idParam)) {
      video_initial = await videoService.getVideoById(BigInt(idParam));
    }

    if (!video_initial) {
      throw new AppError('Video not found', 404);
    }

    const vidID = video_initial.vidID;
    let update: any = {};

    // If multipart/form-data, fields may be in req.body as strings
    // Normalize tags, playlistID, thumbnail
    if (req.is('multipart/form-data')) {
      // Tags
      if (req.body && typeof req.body.tags !== 'undefined') {
        if (req.body.tags) {
          try {
            const parsed = JSON.parse(req.body.tags);
            update.tags = Array.isArray(parsed) ? parsed : String(parsed).split(',').map((t: string) => t.trim()).filter(Boolean);
          } catch {
            update.tags = String(req.body.tags).split(',').map((t: string) => t.trim()).filter(Boolean);
          }
        } else {
          update.tags = [];
        }
      }
      // Playlist
      if (req.body && req.body.playlistID) {
        update.playlistID = BigInt(req.body.playlistID);
      }
      // Thumbnail (handle file upload)
      const thumbFile = (req as any).files?.thumbnail?.[0];
      if (thumbFile?.path) {
        update.thumbnail = thumbFile.path;
      }
      // Other fields
      if (req.body && req.body.title) update.title = req.body.title;
      if (req.body && req.body.description) update.description = req.body.description;
      if (req.body && req.body.visibility) update.visibility = req.body.visibility;
    } else {
      // JSON body
      update = req.body ? { ...req.body } : {};
      if (update.playlistID) update.playlistID = BigInt(update.playlistID);
    }

    // Remove empty fields
    Object.keys(update).forEach((k) => {
      if (update[k] === undefined || update[k] === null || update[k] === '') delete update[k];
    });

    // Call service
    const video = await videoService.updateVideo(vidID, update);
    res.json(toJSON(video));
  } catch (err) {
    console.error('Update video error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyVideosHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userID = BigInt(String(req.user!.id));
    const { page = '1', limit = '20' } = req.query;
    const videos = await videoService.getMyVideos(
      userID,
      Number(page),
      Number(limit),
    );
    // Even for owners, do not leak raw storage keys — return sanitized views.
    const baseUrl = process.env.BACKEND_URL || process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const safe = videos.map((v: any) => sanitizeVideoForPublic(decorateVideoMedia(v, baseUrl)));
    res.json(toJSON(safe));
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
    const idParam = req.params.id;
    if (!idParam) throw new AppError('Video ID is required', 400);
    let video;

    // Try finding by publicID first
    video = await videoService.getVideoByPublicId(idParam);

    // Fallback to numeric ID for legacy support
    if (!video && /^\d+$/.test(idParam)) {
      video = await videoService.getVideoById(BigInt(idParam));
    }

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
