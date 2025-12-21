// src/modules/videos/video.service.ts
import { videoRepository } from './video.repository';
import { tagService } from '../tags/tag.service';
import { jobRepository } from '../jobs/job.repository';
import { getIO } from '../realtime/socket.server';
import { socketEvents } from '../realtime/socket.handlers';
import { uploadToS3, isS3Configured } from '../../config/s3';
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
        await uploadToS3({
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
    const tags = body.tags
      ? typeof body.tags === 'string'
        ? JSON.parse(body.tags)
        : Array.isArray(body.tags)
        ? body.tags
        : []
      : [];

    return {
      channelID,
      title: body.title,
      description: body.description || undefined,
      visibility: (['public', 'private', 'unlisted'].includes(body.visibility) ? body.visibility : 'public') as Visibility,
      tags,
      playlistID: body.playlistID ? BigInt(body.playlistID) : undefined,
    };
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
};
