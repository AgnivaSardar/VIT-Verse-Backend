// src/modules/videos/video.repository.ts
import { prisma } from '../../config/prisma';
import type { Prisma } from '@prisma/client';

export const videoRepository = {
  create(data: Prisma.VideoCreateInput) {
    return prisma.video.create({ data });
  },

  findById(vidID: bigint) {
    return prisma.video.findUnique({
      where: { vidID },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        channel: true,
      },
    });
  },

  list(params: { channelID?: bigint; limit: number; offset: number }) {
    const { channelID, limit, offset } = params;
    return prisma.video.findMany({
      where: channelID ? { channelID } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        channel: true,
      },
    });
  },
};
