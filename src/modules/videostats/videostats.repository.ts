import { prisma } from "../../config/prisma";

export async function getVideoStatsByID(id: bigint) {
  return prisma.videoStats.findUnique({
    where: { vidID: id },
  });
}

export async function createVideoStats(data: {
  vidID: bigint;
  viewsCount?: number;
    likesCount?: number;
    commentsCount?: number;
    sharesCount?: number;
}) {
    return prisma.videoStats.create({
    data: {
      vidID: data.vidID,
      viewsCount: data.viewsCount ?? 0,
        likesCount: data.likesCount ?? 0,
        commentsCount: data.commentsCount ?? 0,
        sharesCount: data.sharesCount ?? 0,
    },
  });
}
export async function updateVideoStats(id: bigint, data: {
    viewsCount?: number;
    likesCount?: number;
    commentsCount?: number;
    sharesCount?: number;
}) {
    return prisma.videoStats.update({
    where: { vidID: id },
    data: data,
  });
}

export async function deleteVideoStats(id: bigint) {
  return prisma.videoStats.delete({
    where: { vidID: id },
  });
}

export async function listVideoStats(page: number, limit: number) {
  const offset = (page - 1) * limit;
  const [total, videoStats] = await Promise.all([
    prisma.videoStats.count(),
    prisma.videoStats.findMany({
      skip: offset,
        take: limit,
    }),
  ]);
  return {
    total,
    page,
    limit,
    data: videoStats,
  };
}

export async function incrementViewsCount(vidID: bigint) {
  return prisma.videoStats.update({
    where: { vidID },
    data: {
      viewsCount: {
        increment: 1,
      },
    },
  });
}

export async function incrementLikesCount(vidID: bigint) {
  return prisma.videoStats.update({
    where: { vidID },
    data: {
      likesCount: {
        increment: 1,
      },
    },
  });
}

export async function decrementLikesCount(vidID: bigint) {
  return prisma.videoStats.update({
    where: { vidID },
    data: {
      likesCount: {
        decrement: 1,
      },
    },
  });
}

export async function incrementCommentsCount(vidID: bigint) {
  return prisma.videoStats.update({
    where: { vidID },
    data: {
      commentsCount: {
        increment: 1,
      },
    },
  });
}

export async function incrementSharesCount(vidID: bigint) {
  return prisma.videoStats.update({
    where: { vidID },
    data: {
      sharesCount: {
        increment: 1,
      },
    },
  });
}

export async function decrementSharesCount(vidID: bigint) {
  return prisma.videoStats.update({
    where: { vidID },
    data: {
      sharesCount: {
        decrement: 1,
      },
    },
  });
}

export async function decrementCommentsCount(vidID: bigint) {
  return prisma.videoStats.update({
    where: { vidID },
    data: {
      commentsCount: {
        decrement: 1,
      },
    },
  });
}

export async function getVideoStatsByVidID(vidID: bigint) {
  return prisma.videoStats.findUnique({
    where: { vidID: vidID },
  });
}