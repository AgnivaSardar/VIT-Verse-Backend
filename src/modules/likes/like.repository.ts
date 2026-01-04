import { prisma } from "../../config/prisma.js";

/**
 * Get a like by ID
 */
export async function getLikeByID(id: bigint) {
  return prisma.likes.findUnique({
    where: { likeID: id },
  });
}

/**
 * Get a like by user and video
 */
export async function getLikeByUserAndContent(userID: bigint, vidID: bigint) {
  return prisma.likes.findFirst({
    where: { userID, vidID },
  });
}

/**
 * Create a new like
 */
export async function createLike(data: {
  userID: bigint;
  vidID: bigint;
}) {
  return prisma.likes.create({
    data: {
      userID: data.userID,
      vidID: data.vidID,
    },
  });
}

/**
 * Delete a like by ID
 */
export async function deleteLike(id: bigint) {
  return prisma.likes.delete({
    where: { likeID: id },
  });
}

/**
 * Delete a like by user and video
 */
export async function deleteLikeByUserAndContent(userID: bigint, vidID: bigint) {
  return prisma.likes.deleteMany({
    where: { userID, vidID },
  });
}

/**
 * Count likes for a video
 */
export async function countLikesByContent(vidID: bigint) {
  return prisma.likes.count({
    where: { vidID },
  });
}

/**
 * Get all likes for a video with user details
 */
export async function getLikesByVideo(vidID: bigint) {
  return prisma.likes.findMany({
    where: { vidID },
    include: {
      user: {
        select: {
          userID: true,
          userName: true,
          userEmail: true,
        },
      },
    },
  });
}

/**
 * Get all likes by a user
 */
export async function getLikesByUser(userID: bigint) {
  return prisma.likes.findMany({
    where: { userID },
    include: {
      video: {
        select: {
          vidID: true,
          title: true,
          createdAt: true,
        },
      },
    },
  });
}

