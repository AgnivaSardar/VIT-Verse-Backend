// src/modules/tags/tag.types.ts
export interface CreateTagInput {
  name: string;
  description?: string;
  color?: string; // hex color
}

export interface UpdateTagInput {
  name?: string;
  description?: string;
  color?: string;
}

export interface AddTagToVideoInput {
  videoID: bigint;
  tagID: bigint;
}

export type TagWithUsage = {
  id: bigint;
  name: string;
  description?: string;
  color?: string;
  usageCount: number;
  videoCount: number;
};
