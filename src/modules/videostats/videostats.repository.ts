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

export async function incrementViewsCount(vidID: bigint, userID?: bigint, ipAddress?: string, userAgent?: string) {
  // Check if view already exists
  let existingView;
  if (userID) {
    existingView = await prisma.views.findFirst({
      where: { vidID, userID },
    });
  } else if (ipAddress && userAgent) {
    existingView = await prisma.views.findFirst({
      where: { vidID, ipAddress, userAgent, userID: null },
    });
  }

  if (existingView) {
    return null; // Already viewed, do nothing
  }

  // Record the new view
  await prisma.views.create({
    data: {
      vidID,
      userID: userID || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    },
  });

  // Increment the counter
  return prisma.videoStats.upsert({
    where: { vidID },
    update: {
      viewsCount: {
        increment: 1,
      },
    },
    create: {
      vidID,
      viewsCount: 1,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    },
  });
}

export async function incrementLikesCount(vidID: bigint) {
  return prisma.videoStats.upsert({
    where: { vidID },
    update: {
      likesCount: {
        increment: 1,
      },
    },
    create: {
      vidID,
      viewsCount: 0,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
    },
  });
}

export async function decrementLikesCount(vidID: bigint) {
  return prisma.videoStats.upsert({
    where: { vidID },
    update: {
      likesCount: {
        decrement: 1,
      },
    },
    create: {
      vidID,
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    },
  });
}

export async function incrementCommentsCount(vidID: bigint) {
  return prisma.videoStats.upsert({
    where: { vidID },
    update: {
      commentsCount: {
        increment: 1,
      },
    },
    create: {
      vidID,
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 1,
      sharesCount: 0,
    },
  });
}

export async function incrementSharesCount(vidID: bigint) {
  return prisma.videoStats.upsert({
    where: { vidID },
    update: {
      sharesCount: {
        increment: 1,
      },
    },
    create: {
      vidID,
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 1,
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