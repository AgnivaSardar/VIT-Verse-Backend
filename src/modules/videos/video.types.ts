// src/modules/videos/video.types.ts
export type Visibility = 'public' | 'private' | 'unlisted' | 'club';

export interface CreateVideoInput {
  channelID: bigint;
  title: string;
  description?: string;
  visibility?: Visibility;
  tags?: string[]; // comma-separated or array
}

export interface UpdateVideoInput {
  title?: string;
  description?: string;
  visibility?: Visibility;
}

export interface TranscodeJobPayload {
  vidID: string;
  filePath: string; // local or S3 key
  originalName: string;
}

export interface VideoWithTags {
  vidID: bigint;
  title: string;
  description?: string | null;
  visibility: Visibility;
  processingStatus: string;
  channel: {
    channelID: bigint;
    channelName: string;
  };
  tags: Array<{
    id: bigint;
    name: string;
    color?: string;
  }>;
  images?: Array<{
    imgURL: string;
    isPrimary: boolean;
  }>;
}
