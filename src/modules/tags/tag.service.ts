// src/modules/tags/tag.service.ts
import { tagRepository } from './tag.repository.js';
import type { CreateTagInput, UpdateTagInput } from './tag.types.js';

export const tagService = {
  async createTag(data: CreateTagInput) {
    return tagRepository.createOrGet(data);
  },

  async getTagById(id: bigint) {
    const tag = await tagRepository.findById(id);
    if (!tag) throw new Error('Tag not found');
    return tag;
  },

  async listPopularTags(limit = 20, page = 1) {
    const offset = (page - 1) * limit;
    return tagRepository.listPopular(limit, offset);
  },

  async searchTags(query: string) {
    return tagRepository.searchByName(query);
  },

  async addTagToVideo(videoID: bigint, tagNames: string[] | string) {
    // Normalize input to string[]
    let names: string[] = [];
    if (!tagNames) names = [];
    else if (Array.isArray(tagNames)) names = tagNames.map(n => String(n).trim()).filter(Boolean);
    else if (typeof tagNames === 'string') {
      try {
        const parsed = JSON.parse(tagNames);
        if (Array.isArray(parsed)) names = parsed.map((n: any) => String(n).trim()).filter(Boolean);
        else names = String(parsed).split(',').map(s => s.trim()).filter(Boolean);
      } catch (_err) {
        names = tagNames.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const results = [];
    for (const name of names) {
      const tag = await tagRepository.createOrGet({ name });
      await tagRepository.addTagToVideo(videoID, tag.id);
      results.push(tag);
    }
    return results;
  },

  async getVideoTags(videoID: bigint) {
    return tagRepository.getTagsForVideo(videoID);
  },

  async removeTagFromVideo(videoID: bigint, tagID: bigint) {
    return tagRepository.removeTagFromVideo(videoID, tagID);
  },
};
