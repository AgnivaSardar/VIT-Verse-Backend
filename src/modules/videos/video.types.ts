// src/modules/videos/video.types.ts

export type Visibility = 'public' | 'private' | 'unlisted' | 'club';

export interface CreateVideoMetadataInput {
  channelID: bigint;
  title: string;
  description?: string;
  visibility?: Visibility;
  tags?: string[];
}

export interface UploadVideoRequestBody {
  channelID: string;    // from form-data
  title: string;
  description?: string;
  visibility?: Visibility;
  tags?: string;        // comma-separated from form-data, parse to string[]
}

export interface TranscodeJobPayload {
  vidID: string;        // store BigInt as string
  filePath: string;     // local path or S3 key
}
