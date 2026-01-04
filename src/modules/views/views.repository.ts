import { prisma } from "../../config/prisma.js";

export async function getViewByID(id: bigint) {
  return prisma.views.findUnique({
    where: { viewID: id },
  });
}

export async function createView(data: {
  userID: bigint;
  vidID: bigint;
    watchTime: number;
    ipAddress: string;
    userAgent: string;
}) {
    return prisma.views.create({
    data: {
      userID: data.userID,
      vidID: data.vidID,
        watchTime: data.watchTime,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
    },
  });
}

export async function updateView(id: bigint, data: {
    watchTime?: number;
    ipAddress?: string;
    userAgent?: string;
}) {
  return prisma.views.update({
    where: { viewID: id },
    data: data,
  });
}

export async function deleteView(id: bigint) {
  return prisma.views.delete({
    where: { viewID: id },
  });
}

export async function listViews(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const views = await prisma.views.findMany({
    skip: skip,
    take: limit,
  });
  const totalViews = await prisma.views.count();
  return { views, totalViews };
}

export async function getViewsByUserID(userID: bigint) {
  return prisma.views.findMany({
    where: { userID: userID },
  });
}

export async function getViewsByVidID(vidID: bigint) {
  return prisma.views.findMany({
    where: { vidID: vidID },
  });
}
