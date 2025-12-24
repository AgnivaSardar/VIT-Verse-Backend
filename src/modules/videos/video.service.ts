// src/modules/videos/video.service.ts
import { videoRepository } from './video.repository';
import { tagService } from '../tags/tag.service';
import { jobRepository } from '../jobs/job.repository';
import { getIO } from '../realtime/socket.server';
import { socketEvents } from '../realtime/socket.handlers';
import { uploadToS3, isS3Configured, getS3PublicUrl } from '../../config/s3';
import { supabaseStorage } from '../../config/supabase';
import * as videoSearch from './video.search';
import * as imageRepo from '../images/image.repository';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import util from 'util';
import type {
  CreateVideoInput,
  UpdateVideoInput,
  TranscodeJobPayload,
  Visibility,
} from './video.types';
import type { Prisma } from '@prisma/client';
import crypto from 'crypto';

export const videoService = {
  async createVideo(
    input: CreateVideoInput,
    filePath: string,
    fileName: string,
    storageType: 'local' | 's3',
    uploaderID: bigint,
    fileBuffer?: Buffer,
    mimeType?: string,
    fileSize?: number,
  ) {
    let s3Key: string | null = null;
    let s3Bucket: string | null = null;
    let publicUrl: string | null = null;

    // Upload to S3 if configured
    if (storageType === 's3') {
      if (!isS3Configured()) {
        throw new Error('S3 is not properly configured. Please set AWS credentials.');
      }
      if (!fileBuffer) {
        throw new Error('File buffer is required for S3 upload');
      }

      // Generate unique S3 key with folder structure
      const timestamp = Date.now();
      const randomHash = crypto.randomBytes(8).toString('hex');
      const ext = fileName.split('.').pop();
      s3Key = `videos/${uploaderID}/${timestamp}-${randomHash}.${ext}`;

      try {
        // Upload returns CloudFront URL if configured
        publicUrl = await uploadToS3({
          key: s3Key,
          body: fileBuffer,
          metadata: {
            originalName: fileName,
            mimeType: mimeType || 'video/mp4',
            size: fileSize || fileBuffer.length,
            uploadedBy: uploaderID.toString(),
            title: input.title,
            description: input.description || '',
          },
          contentType: mimeType || 'video/mp4',
          isPublic: input.visibility === 'public',
        });
        s3Bucket = process.env.S3_BUCKET_NAME || null;
        console.log(`✅ Video uploaded to S3: ${s3Key}`);
        console.log(`📡 CDN URL: ${publicUrl}`);
      } catch (error: any) {
        console.error('❌ S3 upload failed:', error);
        throw new Error(`S3 upload failed: ${error.message}`);
      }
    }

    const video = await videoRepository.create({
      channel: { connect: { channelID: input.channelID } },
      title: input.title,
      description: input.description ?? null,
      visibility: input.visibility ?? 'public',
      processingStatus: 'UPLOADED',
      ...(storageType === 'local'
        ? {
            s3Bucket: null,
            s3KeyOriginal: filePath,
          }
        : {
            s3Bucket,
            s3KeyOriginal: s3Key,
          }),
    });

    // Add tags if provided
    if (input.tags && input.tags.length > 0) {
      await tagService.addTagToVideo(video.vidID, input.tags);
    }

    // Enqueue transcode job
    const jobPayload: TranscodeJobPayload = {
      vidID: video.vidID.toString(),
      filePath: storageType === 's3' ? s3Key! : filePath,
      originalName: fileName,
      storageType,
    };
    await jobRepository.createTranscodeJob(jobPayload);

    // Notify uploader via socket
    const io = getIO();
    socketEvents.notifyVideoProcessed(io, uploaderID.toString(), video.vidID.toString());

    return videoRepository.findById(video.vidID, true);
  },

  async getVideoById(vidID: bigint) {
    return videoRepository.findById(vidID, true);
  },

  async deleteVideo(vidID: bigint) {
    return videoRepository.delete(vidID);
  },

  async listVideos(params: {
    channelID?: bigint;
    tagID?: bigint;
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    return videoRepository.list({
      channelID: params.channelID,
      tagID: params.tagID,
      limit,
      offset,
      status: params.status,
    });
  },

  async updateVideo(vidID: bigint, data: UpdateVideoInput) {
    const video = await videoRepository.update(vidID, data as Prisma.VideoUpdateInput);
    // Update tags if present
    if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
      await tagService.addTagToVideo(vidID, data.tags);
    }
    return videoRepository.findById(vidID, true);
  },

  async getMyVideos(userID: bigint, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return videoRepository.getMyVideos(userID, limit, offset);
  },

  async parseUploadInput(
    body: any,
    filePath: string,
    fileName: string,
    channelID: bigint,
  ): Promise<CreateVideoInput> {
    let tags: string[] = [];
    if (body.tags) {
      if (Array.isArray(body.tags)) {
        tags = body.tags.map((t: any) => String(t).trim()).filter(Boolean);
      } else if (typeof body.tags === 'string') {
        // Try JSON parse first (frontend may send JSON array as string)
        try {
          const parsed = JSON.parse(body.tags);
          if (Array.isArray(parsed)) {
            tags = parsed.map((t: any) => String(t).trim()).filter(Boolean);
          } else if (typeof parsed === 'string') {
            // single string inside JSON
            tags = parsed.split(',').map(s => s.trim()).filter(Boolean);
          }
        } catch (_err) {
          // Fallback: comma-separated string (e.g. "tag1,tag2")
          tags = body.tags.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
    }

    return {
      channelID,
      title: body.title,
      description: body.description || undefined,
      visibility: (['public', 'private', 'unlisted'].includes(body.visibility) ? body.visibility : 'public') as Visibility,
      tags,
      playlistID: body.playlistID ? BigInt(body.playlistID) : undefined,
    };
  },

  async computeDurationSeconds(filePath: string): Promise<number | null> {
    try {
      const execFilePromise = util.promisify(execFile);
      const { stdout } = await execFilePromise('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        filePath,
      ]);
      const val = parseFloat(stdout.trim());
      return Number.isFinite(val) ? Math.round(val) : null;
    } catch (err) {
      console.warn('ffprobe failed to compute duration', err);
      return null;
    }
  },

  async generateThumbnailFromVideo(filePath: string, outputDir: string): Promise<{ fileName: string; fullPath: string } | null> {
    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const execFilePromise = util.promisify(execFile);
      const base = path.basename(filePath).split('.')[0];
      const outName = `${base}-thumb.jpg`;
      const outPath = path.join(outputDir, outName);
      // Grab a frame around 2s (or start) for quick thumb
      await execFilePromise('ffmpeg', ['-ss', '2', '-i', filePath, '-frames:v', '1', '-q:v', '2', outPath]);
      return { fileName: outName, fullPath: outPath };
    } catch (err) {
      console.warn('ffmpeg failed to generate thumbnail', err);
      return null;
    }
  },

  async uploadThumbnailToS3(localPath: string, vidID: bigint, uploaderID: bigint): Promise<string | null> {
    if (!isS3Configured()) {
      console.warn('S3 not configured, skipping thumbnail upload');
      return null;
    }
    
    try {
      const buffer = fs.readFileSync(localPath);
      const timestamp = Date.now();
      const randomHash = crypto.randomBytes(8).toString('hex');
      const s3Key = `thumbnails/${uploaderID}/${vidID}-${timestamp}-${randomHash}.jpg`;
      
      const publicUrl = await uploadToS3({
        key: s3Key,
        body: buffer,
        metadata: {
          originalName: path.basename(localPath),
          mimeType: 'image/jpeg',
          size: buffer.length,
          uploadedBy: uploaderID.toString(),
          videoID: vidID.toString(),
        },
        contentType: 'image/jpeg',
        isPublic: true,
      });
      
      // Clean up local file after upload
      try { fs.unlinkSync(localPath); } catch (_e) { /* ignore */ }
      
      console.log(`✅ Thumbnail uploaded to S3: ${publicUrl}`);
      return publicUrl;
    } catch (error: any) {
      console.error('❌ Failed to upload thumbnail to S3:', error);
      return null;
    }
  },

  async saveThumbnailRecord(vidID: bigint, imgURL: string) {
    try {
      // Extract S3 key if URL is from S3/CloudFront
      let s3Key: string | null = null;
      let s3Bucket: string | null = null;
      
      if (imgURL.startsWith('thumbnails/')) {
        // Direct S3 key path
        s3Key = imgURL;
        s3Bucket = process.env.S3_BUCKET_NAME || null;
      } else if (imgURL.includes('cloudfront.net') || imgURL.includes('amazonaws.com')) {
        // Extract key from CloudFront or S3 URL
        const urlParts = imgURL.split('/');
        const keyIndex = urlParts.findIndex(part => part === 'thumbnails');
        if (keyIndex !== -1) {
          s3Key = urlParts.slice(keyIndex).join('/');
          s3Bucket = process.env.S3_BUCKET_NAME || null;
        }
      }
      
      await imageRepo.createImage({
        vidID,
        imgURL,
        s3Key,
        s3Bucket,
        isPrimary: true,
      });
    } catch (err) {
      console.warn('Failed to save thumbnail record', err);
    }
  },

  async getVideoStreamUrl(video: any): Promise<string> {
    // If video is stored in S3, generate presigned URL
    if (video.s3Bucket && video.s3KeyOriginal) {
      const { getSignedDownloadUrl } = await import('../../config/s3');
      return getSignedDownloadUrl(video.s3KeyOriginal, 3600); // 1 hour expiry
    }
    
    // For local storage, return direct path (handled by static file server)
    return video.s3KeyOriginal || '';
  },

  async searchByTitle(query: string, limit: number = 10) {
    return videoSearch.searchVideosByTitle(query, limit);
  },
};
