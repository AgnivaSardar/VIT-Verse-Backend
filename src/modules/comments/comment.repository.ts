import { prisma } from "../../config/prisma";

export async function getCommentByID(id: bigint) {
  return prisma.comments.findUnique({
    where: { commID: id },
  });
}

export async function createComment(data: {
  userID: bigint;
  vidID: bigint;
    description: string;
}) {
  return prisma.comments.create({
    data: {
      userID: data.userID,
      vidID: data.vidID,
      description: data.description,
    },
  });
}

export async function listCommentsByVideoID(vidID: bigint) {
  return prisma.comments.findMany({
    where: { vidID },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateComment(id: bigint, data: {
    vidID?: bigint;
    description?: string;
}) {
  return prisma.comments.update({
    where: { commID: id },
    data: data,
  });
}

export async function deleteComment(id: bigint) {
  return prisma.comments.delete({
    where: { commID: id },
  });
}
