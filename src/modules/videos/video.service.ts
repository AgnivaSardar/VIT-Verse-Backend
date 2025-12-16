// src/modules/videos/video.service.ts
import { videoRepository } from './video.repository';
import { jobRepository } from '../jobs/job.repository';
import type {
  CreateVideoMetadataInput,
  UploadVideoRequestBody,
  TranscodeJobPayload,
} from './video.types';

export const videoService = {
  async createVideoRecord(
    input: CreateVideoMetadataInput,
    filePath: string,
    storageType: 'local' | 's3',
  ) {
    const { channelID, title, description, visibility, tags } = input;

    const video = await videoRepository.create({
      channel: { connect: { channelID } },
      title,
      description: description ?? null,
      visibility: visibility ?? 'public',
      tags: tags ?? [],
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

    const jobPayload: TranscodeJobPayload = {
      vidID: video.vidID.toString(),
      filePath,
    };

    await jobRepository.createTranscodeJob(jobPayload);

    return video;
  },

  async getVideoById(vidID: bigint) {
    return videoRepository.findById(vidID);
  },

  async listVideos(params: { channelID?: bigint; page?: number; limit?: number }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    return videoRepository.list({
      channelID: params.channelID,
      limit,
      offset,
    });
  },

  parseUploadBody(body: UploadVideoRequestBody): CreateVideoMetadataInput {
    const channelID = BigInt(body.channelID);
    const tags =
      body.tags && body.tags.length > 0
        ? body.tags.split(',').map((t) => t.trim())
        : [];

    return {
      channelID,
      title: body.title,
      description: body.description,
      visibility: body.visibility ?? 'public',
      tags,
    };
  },
};
