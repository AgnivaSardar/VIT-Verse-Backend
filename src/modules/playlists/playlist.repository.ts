import { prisma } from "../../config/prisma";

export async function getPlaylistByID(id: bigint) {
  return prisma.playlist.findUnique({
    where: { pID: id },
    include: {
      videos: {
        include: {
          video: {
            select: {
              vidID: true,
              title: true,
              description: true,
              duration: true,
              createdAt: true,
              cloudflarePlaybackURL: true,
              channel: {
                select: {
                  channelID: true,
                  channelName: true,
                  channelType: true,
                  user: {
                    select: {
                      userID: true,
                      userName: true,
                    },
                  },
                },
              },
              images: {
                select: {
                  imgURL: true,
                },
                where: {
                  isPrimary: true,
                },
                take: 1,
              },
            },
          },
        },
        orderBy: { position: 'asc' },
      },
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

export async function getPlaylistsByUserID(userID: bigint) {
  return prisma.playlist.findMany({
    where: { userID },
    include: {
      videos: {
        include: {
          video: {
            select: {
              vidID: true,
              title: true,
              createdAt: true,
              cloudflarePlaybackURL: true,
              images: {
                select: { imgURL: true },
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { position: 'asc' },
        take: 1,
      },
      user: {
        select: {
          userName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllPublicPlaylists() {
  return prisma.playlist.findMany({
    where: { isPublic: true },
    include: {
      videos: {
        include: {
          video: {
            select: {
              vidID: true,
              title: true,
              createdAt: true,
              cloudflarePlaybackURL: true,
              channel: {
                select: {
                  channelID: true,
                  channelName: true,
                  channelType: true,
                  user: {
                    select: {
                      userID: true,
                      userName: true,
                    },
                  },
                },
              },
              images: {
                select: {
                  imgURL: true,
                },
                where: {
                  isPrimary: true,
                },
                take: 1,
              },
            },
          },
        },
        orderBy: { position: 'asc' },
        take: 4,
      },
      user: {
        select: {
          userName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
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

export async function addVideoToPlaylist(playlistID: bigint, videoID: bigint) {
  const maxPosition = await prisma.playlistVideos.findFirst({
    where: { pID: playlistID },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  
  return prisma.playlistVideos.create({
    data: {
      pID: playlistID,
      vidID: videoID,
      position: (maxPosition?.position ?? -1) + 1,
    },
  });
}

export async function removeVideoFromPlaylist(playlistVideoID: bigint) {
  return prisma.playlistVideos.delete({
    where: { pvID: playlistVideoID },
  });
}

