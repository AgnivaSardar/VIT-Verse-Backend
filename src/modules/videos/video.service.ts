// src/modules/videos/video.service.ts
import { videoRepository } from './video.repository';
import { tagService } from '../tags/tag.service';
import { jobRepository } from '../jobs/job.repository';
import { getIO } from '../realtime/socket.server';
import { socketEvents } from '../realtime/socket.handlers';
import type {
  CreateVideoInput,
  UpdateVideoInput,
  TranscodeJobPayload,
  Visibility,
} from './video.types';
import type { Prisma } from '@prisma/client';

export const videoService = {
  async createVideo(
    input: CreateVideoInput,
    filePath: string,
    fileName: string,
    storageType: 'local' | 's3',
    uploaderID: bigint, // from req.user
  ) {
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
            s3Bucket: process.env.S3_BUCKET_NAME ?? null,
            s3KeyOriginal: filePath,
          }),
    });

    // Add tags if provided
    if (input.tags && input.tags.length > 0) {
      await tagService.addTagToVideo(video.vidID, input.tags);
    }

    // Enqueue transcode job
    const jobPayload: TranscodeJobPayload = {
      vidID: video.vidID.toString(),
      filePath,
      originalName: fileName,
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
  ): Promise<CreateVideoInput> {
    const channelID = BigInt(body.channelID);
    const tags = body.tags
      ? typeof body.tags === 'string'
        ? body.tags.split(',').map((t: string) => t.trim())
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
    };
  },
};
