// src/modules/tags/tag.repository.ts
import { prisma } from '../../config/prisma';
import type { Prisma } from '@prisma/client';

export const tagRepository = {
  // Create or get existing tag (normalize duplicates)
  async createOrGet(data: { name: string; description?: string; color?: string }) {
    // First try to find existing tag by name
    let tag = await prisma.tag.findUnique({
      where: { name: data.name.toLowerCase() },
    });

    if (!tag) {
      // Create new tag
      tag = await prisma.tag.create({
        data: {
          name: data.name.toLowerCase(),
          description: data.description,
          color: data.color,
        },
      });
    }

    return tag;
  },

  findById(id: bigint) {
    return prisma.tag.findUnique({
      where: { id },
      include: {
        videos: true,
      },
    });
  },

  listPopular(limit = 20, offset = 0) {
    return prisma.tag.findMany({
      orderBy: {
        videos: {
          _count: 'desc',
        },
      },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: { videos: true },
        },
      },
    });
  },

  searchByName(query: string) {
    return prisma.tag.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 10,
    });
  },

  incrementUsage(tagID: bigint) {
    return prisma.tag.update({
      where: { id: tagID },
      data: { usageCount: { increment: 1 } },
    });
  },

  // Video <-> Tag relations
  async addTagToVideo(videoID: bigint, tagID: bigint) {
    await prisma.videoTag.upsert({
      where: {
        videoID_tagID: { videoID, tagID },
      },
      update: {},
      create: {
        videoID,
        tagID,
      },
    });
    return tagRepository.incrementUsage(tagID);
  },

  async removeTagFromVideo(videoID: bigint, tagID: bigint) {
    const tag = await prisma.tag.update({
      where: { id: tagID },
      data: { usageCount: { decrement: 1 } },
    });
    await prisma.videoTag.delete({
      where: {
        videoID_tagID: { videoID, tagID },
      },
    });
    return tag;
  },

  getTagsForVideo(videoID: bigint) {
    return prisma.videoTag.findMany({
      where: { videoID },
      include: {
        tag: true,
      },
    });
  },
};
