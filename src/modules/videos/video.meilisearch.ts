// src/modules/videos/video.meilisearch.ts
import { videoIndex } from '../../config/meilisearch';

export interface VideoSearchDocument {
  vidID: string;
  title: string;
  description?: string;
  channelID: string;
  channelName: string;
  tags: string[];
  visibility: string;
  createdAt: string;
}

export const videoSearch = {
  async indexVideo(video: any) {
    const doc: VideoSearchDocument = {
      vidID: video.vidID.toString(),
      title: video.title,
      description: video.description ?? undefined,
      channelID: video.channelID.toString(),
      channelName: video.channel.channelName,
      tags: video.tags ?? [],
      visibility: video.visibility,
      createdAt: video.createdAt.toISOString(),
    };

    await videoIndex.addDocuments([doc]); // async, Meilisearch handles task queue
  },

  async deleteVideo(vidID: bigint) {
    await videoIndex.deleteDocument(vidID.toString());
  },

  async search(query: string, limit = 20, offset = 0) {
    return videoIndex.search<VideoSearchDocument>(query, {
      limit,
      offset,
      filter: ['visibility = "public"'],
    });
  },
};
