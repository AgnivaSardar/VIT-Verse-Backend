// src/config/meilisearch.ts
import { Meilisearch } from 'meilisearch';

export const meiliClient = new Meilisearch({
  host: process.env.MEILI_HOST || 'http://127.0.0.1:7700',
  apiKey: process.env.MEILI_API_KEY, // use master/admin in backend
});

export const videoIndex = meiliClient.index('videos');
