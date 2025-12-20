import { AppError, ValidationError } from '../../common/errors';
import * as channelRepo from './channel.repository';
import { CreateChannelRequest, UpdateChannelRequest } from './channel.types';

export async function createChannel(data: CreateChannelRequest): Promise<void> {
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
    const channel = await channelRepo.getChannelByID(channelID);
    if (!channel) {
        throw new AppError('Channel not found', 404);
    }
    return channel;
}

export async function deleteChannel(channelID: bigint): Promise<void> {
    const channel = await channelRepo.getChannelByID(channelID);
    if (!channel) {
        throw new AppError('Channel not found', 404);
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

export function updateChannelService(channelID: bigint, input: UpdateChannelRequest) {
    throw new Error('Function not implemented.');
}

export async function listChannelsService(page: number, limit: number) {
    return await channelRepo.listChannels(page, limit);
}

export function subscribeToChannelService(channelID: bigint, userID: bigint) {
    throw new Error('Function not implemented.');
}

export function unsubscribeFromChannelService(channelID: bigint, userID: bigint) {
    throw new Error('Function not implemented.');
}

export function getChannelByNameAndUserService(channelName: string, userID: bigint) {
    throw new Error('Function not implemented.');
}

export const channelService = {
    createChannel,
    getChannelByID,
    deleteChannel,
    createChannelService,
    getChannelService,
    deleteChannelService,
    updateChannelService,
    listChannelsService,
    subscribeToChannelService,
    unsubscribeFromChannelService,
    getChannelByNameAndUserService,
};
