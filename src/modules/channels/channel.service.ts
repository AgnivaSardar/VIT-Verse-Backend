import { AppError, ValidationError } from '../../common/errors.js';
import * as channelRepo from './channel.repository.js';
import { CreateChannelRequest, UpdateChannelRequest } from './channel.types.js';
import { prisma } from '../../config/prisma.js';
import * as subscriptionService from '../subscriptions/subscription.service.js';
import { deleteFromS3 } from '../../config/s3.js';
import fs from 'fs';
import path from 'path';

export async function createChannel(data: CreateChannelRequest): Promise<void> {
    // Enforce single channel per user
    const userChannel = await channelRepo.getChannelByUserID(data.userID);
    if (userChannel) {
        throw new ValidationError('User already has a channel');
    }
    // Validate unique channel name for the user
    const existingChannel = await channelRepo.getChannelByNameAndUser(data.channelName, data.userID);
    if (existingChannel) {
        throw new ValidationError('Channel name already exists for this user');
    }
    await channelRepo.createChannel({
        ...data,
        channelSubscribers: [data.userID], // Initialize with the creator as the first subscriber
    });
}

export async function getChannelByID(channelID: bigint) {
    return await channelRepo.getChannelByID(channelID);
}

export async function getChannelByPublicID(publicID: string) {
    return await channelRepo.getChannelByPublicID(publicID);
}

export async function deleteChannel(channelID: bigint, userID: bigint): Promise<void> {
    const channel = await channelRepo.getChannelByID(channelID);
    if (!channel) {
        throw new AppError('Channel not found', 404);
    }
    if (BigInt(channel.userID) !== userID) {
        throw new AppError('You are not allowed to delete this channel', 403);
    }

    // Remove logo file
    const logo = (channel as any).channelImage as string | undefined;
    if (logo) {
        if (logo.startsWith('http')) {
            // S3/CloudFront URL - extract key and delete from S3
            const urlObj = new URL(logo);
            const s3Key = urlObj.pathname.substring(1); // Remove leading /
            try {
                await deleteFromS3(s3Key);
                console.log(`✅ Deleted S3 logo: ${s3Key}`);
            } catch (e) {
                console.warn('Failed to delete S3 logo:', e);
            }
        } else if (logo.startsWith('uploads/')) {
            // Local file
            const fsPath = path.join(process.cwd(), logo);
            try { fs.unlinkSync(fsPath); } catch (_e) { /* ignore */ }
        }
    }

    await channelRepo.deleteChannel(channelID);
}

export function createChannelService(input: CreateChannelRequest) {
    throw new Error('Function not implemented.');
}

export function getChannelService(channelID: bigint) {
    throw new Error('Function not implemented.');
}

export function deleteChannelService(channelID: bigint) {
    throw new Error('Function not implemented.');
}

export async function updateChannelService(channelID: bigint, userID: bigint, input: UpdateChannelRequest) {
    const channel = await channelRepo.getChannelByID(channelID);
    if (!channel) {
        throw new AppError('Channel not found', 404);
    }
    if (BigInt(channel.userID) !== userID) {
        throw new AppError('You are not allowed to update this channel', 403);
    }

    // Delete old logo if replaced
    if (input.channelImage && channel.channelImage) {
        if (channel.channelImage.startsWith('http')) {
            // S3/CloudFront URL
            const urlObj = new URL(channel.channelImage);
            const s3Key = urlObj.pathname.substring(1);
            try {
                await deleteFromS3(s3Key);
                console.log(`✅ Deleted old S3 logo: ${s3Key}`);
            } catch (e) {
                console.warn('Failed to delete old S3 logo:', e);
            }
        } else if (channel.channelImage.startsWith('uploads/')) {
            // Local file
            const oldPath = path.join(process.cwd(), channel.channelImage);
            try { fs.unlinkSync(oldPath); } catch (_e) { /* ignore */ }
        }
    }

    await channelRepo.updateChannel(channelID, {
        channelName: input.channelName,
        channelDescription: input.channelDescription,
        channelType: input.channelType as any,
        isPremium: input.isPremium,
        channelImage: input.channelImage,
    });
}

export async function listChannelsService(page: number, limit: number) {
    return await channelRepo.listChannels(page, limit);
}

export async function getUserChannel(userID: bigint) {
    return await channelRepo.getChannelByUserID(userID);
}

export async function subscribeToChannelService(channelID: bigint, userID: bigint) {
    const channel = await channelRepo.getChannelByID(channelID);
    if (!channel) {
        throw new AppError('Channel not found', 404);
    }

    // Perform subscription via subscriptions module (handles duplicates and socket events)
    await subscriptionService.subscribe(channelID, userID);

    // Sync denormalized subscriber count on Channel to actual subscription count
    const subCount = await prisma.subscription.count({ where: { channelID } });
    await prisma.channel.update({
        where: { channelID },
        data: { channelSubscribers: BigInt(subCount) },
    });
}

export async function unsubscribeFromChannelService(channelID: bigint, userID: bigint) {
    const channel = await channelRepo.getChannelByID(channelID);
    if (!channel) {
        throw new AppError('Channel not found', 404);
    }

    await subscriptionService.unsubscribe(channelID, userID);

    const subCount = await prisma.subscription.count({ where: { channelID } });
    await prisma.channel.update({
        where: { channelID },
        data: { channelSubscribers: BigInt(subCount) },
    });
}

export async function getChannelByNameAndUserService(channelName: string, userID: bigint) {
    const channel = await channelRepo.getChannelByNameAndUser(channelName, userID);
    if (!channel) {
        throw new AppError('Channel not found', 404);
    }
    return channel;
}

export async function getChannelStats(channelID: bigint) {
    const channel = await channelRepo.getChannelByID(channelID);
    if (!channel) {
        throw new AppError('Channel not found', 404);
    }

    const videos = await prisma.video.findMany({
        where: { channelID },
        select: { vidID: true },
    });
    const videoIds = videos.map(v => v.vidID);

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;

    if (videoIds.length > 0) {
        const stats = await prisma.videoStats.findMany({
            where: { vidID: { in: videoIds } },
            select: { viewsCount: true, likesCount: true, commentsCount: true, sharesCount: true },
        });
        for (const s of stats) {
            totalViews += Number(s.viewsCount ?? 0);
            totalLikes += Number(s.likesCount ?? 0);
            totalComments += Number(s.commentsCount ?? 0);
            totalShares += Number(s.sharesCount ?? 0);
        }
    }

    const totalPlaylists = await prisma.playlist.count({ where: { userID: channel.userID } });

    const since = new Date();
    since.setMonth(since.getMonth() - 11);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    // Get views for all videos in this channel
    const viewsRows = videoIds.length > 0 ? await prisma.views.findMany({
        where: {
            vidID: { in: videoIds },
            watchedAt: { gte: since }
        },
        select: { watchedAt: true },
    }) : [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        const k = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthlyMap[k] = 0;
    }
    for (const r of viewsRows) {
        const d = new Date(r.watchedAt as any);
        const k = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (monthlyMap[k] !== undefined) monthlyMap[k] += 1;
    }
    const monthlyViews = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

    return {
        totalVideos: videos.length,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        subscribers: Number(channel.channelSubscribers ?? 0),
        totalPlaylists,
        monthlyViews,
    };
}

export const channelService = {
    createChannel,
    getChannelByID,
    getChannelByPublicID,
    deleteChannel,
    createChannelService,
    getChannelService,
    deleteChannelService,
    updateChannelService,
    listChannelsService,
    getUserChannel,
    subscribeToChannelService,
    unsubscribeFromChannelService,
    getChannelByNameAndUserService,
    getChannelStats,
};
