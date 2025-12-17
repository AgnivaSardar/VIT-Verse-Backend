import { prisma } from "../../config/prisma";

export async function getPlaylistByID(id: bigint) {
  return prisma.playlist.findUnique({
    where: { pID: id },
  });
}  

export async function createPlaylist(data: {
  userID: bigint;
  name: string;
    description: string;
    isPublic: boolean;
    isPremium: boolean;
}) {
    return prisma.playlist.create({
    data: {
      userID: data.userID,
      name: data.name,
        description: data.description,
        isPublic: data.isPublic,
        isPremium: data.isPremium,
    },
  });
}

export async function updatePlaylist(id: bigint, data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
    isPremium?: boolean;
}) {
    return prisma.playlist.update({
    where: { pID: id },
    data: data,
  });
}

export async function deletePlaylist(id: bigint) {
    return prisma.playlist.delete({
    where: { pID: id },
  });
}

