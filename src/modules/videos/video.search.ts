import { prisma } from '../../config/prisma.js';

/**
 * Search videos by title using simple substring matching
 * (can be replaced with full-text search for production)
 */
export async function searchVideosByTitle(query: string, limit: number = 10) {
  const videos = await prisma.video.findMany({
    where: {
      AND: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          visibility: 'public',
        },
      ],
    },
    include: {
      channel: true,
      images: true,
      videoTags: true,
    },
    take: limit,
  });

  return videos;
}
