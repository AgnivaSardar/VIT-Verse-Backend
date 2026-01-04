// src/modules/videos/video.repository.ts
import { prisma } from '../../config/prisma.js';
import type { Prisma } from '@prisma/client';

export const videoRepository = {
  create(data: Prisma.VideoCreateInput) {
    if (!data.publicID) {
      const { generateVideoID } = require('../../utils/id.utils');
      data.publicID = generateVideoID();
    }
    return prisma.video.create({ data });
  },

  findByPublicId(publicID: string, includeTags = false) {
    const include = {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      channel: true,
      stats: true,
    };

    if (includeTags) {
      (include as any).videoTags = {
        include: {
          tag: {
            select: { id: true, name: true, color: true },
          },
        },
      };
    }

    return prisma.video.findUnique({
      where: { publicID },
      include,
    });
  },

  findById(vidID: bigint, includeTags = false) {
    const include = {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      channel: true,
      stats: true,
    };

    if (includeTags) {
      (include as any).videoTags = {
        include: {
          tag: {
            select: { id: true, name: true, color: true },
          },
        },
      };
    }

    return prisma.video.findUnique({
      where: { vidID },
      include,
    });
  },

  list(params: {
    channelID?: bigint;
    tagID?: bigint;
    limit: number;
    offset: number;
    status?: string;
  }) {
    const { channelID, tagID, limit, offset, status } = params;

    const where: any = {};
    if (channelID) where.channelID = channelID;
    if (status) where.processingStatus = status;
    if (tagID) {
      where.videoTags = {
        some: { tagID },
      };
    }

    return prisma.video.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        channel: true,
        stats: true,
        videoTags: {
          include: {
            tag: {
              select: { id: true, name: true, color: true },
            },
          },
        },
      },
    });
  },

  update(vidID: bigint, data: Prisma.VideoUpdateInput) {
    return prisma.video.update({
      where: { vidID },
      data,
    });
  },

  delete(vidID: bigint) {
    return prisma.video.delete({
      where: { vidID },
    });
  },

  getMyVideos(userID: bigint, limit: number, offset: number) {
    return prisma.video.findMany({
      where: {
        channel: {
          userID,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        channel: true,
        stats: true,
      },
    });
  },
};
