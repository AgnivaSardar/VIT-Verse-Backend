import { prisma } from "../../config/prisma";

export async function getChannelByID(id: bigint) {
  return prisma.channel.findUnique({
    where: { channelID: id },
  });
}

export async function getChannelByNameAndUser(channelName: string, userID: bigint) {
  return prisma.channel.findFirst({
    where: { channelName: channelName, userID: userID },
  });
}

export async function getChannelByUserID(userID: bigint) {
  return prisma.channel.findFirst({
    where: { userID: userID },
  });
}

export async function createChannel(data: {
  userID: bigint;
  channelName: string;
    channelDescription: string;
    channelType: 'public' | 'private' | 'protected';
    channelSubscribers: bigint[];
    isPremium: boolean;
    channelImage?: string;
}) {
  return prisma.channel.create({
    data: {
      userID: data.userID,
      channelName: data.channelName,
      channelDescription: data.channelDescription,
      channelType: data.channelType,
      channelSubscribers: data.channelSubscribers[0], // Store only the first subscriber, or adjust as needed
      isPremium: data.isPremium,
      channelImage: data.channelImage,
    },
  });
}

export async function updateChannel(id: bigint, data: {
    channelName?: string;
    channelDescription?: string;
    channelType?: 'public' | 'private' | 'protected';
    channelSubscribers?: bigint; // Change to single bigint
    isPremium?: boolean;
    channelImage?: string;
}) {
  return prisma.channel.update({
    where: { channelID: id },
    data: data,
  });
}

export async function deleteChannel(id: bigint) {
  return prisma.channel.delete({
    where: { channelID: id },
  });
}

export async function listChannels(page: number, limit: number) {
  const skip = (page - 1) * limit;
  return prisma.channel.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

