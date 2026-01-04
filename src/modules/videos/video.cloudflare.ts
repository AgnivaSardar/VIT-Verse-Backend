// src/modules/videos/video.cloudflare.ts
import { cloudflareStreamApi } from '../../config/cloudflare.js';

export interface CloudflareStreamVideo {
  uid: string;
  readyToStream: boolean;
  playback: { hls?: string; dash?: string };
}

export const cloudflareStream = {
  // option A: copy from a public S3 URL (easiest if your S3 object is public or presigned)
  async copyFromUrl(url: string): Promise<CloudflareStreamVideo> {
    const res = await cloudflareStreamApi.post('/copy', {
      url,
    });
    const result = res.data.result;
    return {
      uid: result.uid,
      readyToStream: result.readyToStream,
      playback: {
        hls: result.playback?.hls,
        dash: result.playback?.dash,
      },
    };
  },

  // option B: initiate direct upload (Tus) and then upload chunks from backend or frontend
  async createDirectUpload() {
    const res = await cloudflareStreamApi.post('/direct_upload', {
      maxDurationSeconds: 3600,
    });
    return res.data.result; // contains uploadURL and uid
  },
};
