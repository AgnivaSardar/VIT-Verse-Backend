import { AppError } from "../../common/errors.js";
import * as subscriptionRepo from "./subscription.repository.js";
import { getIO } from "../realtime/socket.server.js";
import { socketEvents } from "../realtime/socket.handlers.js";
import * as channelService from "../channels/channel.service.js";

export async function subscribe(channelID: bigint, userID: bigint) {
    // Check if the subscription already exists
    const existingSubscription = await subscriptionRepo.getSubscriptionByUserAndChannel(userID, channelID);
    if (existingSubscription) {
        throw new AppError('User is already subscribed to this channel', 400);
    }
    await subscriptionRepo.createSubscription({
        userID: userID,
        channelID: channelID,
    });

    // Emit socket event to notify user of successful subscription
    try {
        const io = getIO();
        const channel = await channelService.getChannelByID(channelID);
        if (channel) {
            socketEvents.notifySubscription(io, userID.toString(), channelID.toString(), channel.channelName);
        }
    } catch (err) {
        console.log('Socket or channel fetch error on subscribe:', err);
    }
}

export async function unsubscribe(channelID: bigint, userID: bigint) {
    // Check if the subscription exists
    const existingSubscription = await subscriptionRepo.getSubscriptionByUserAndChannel(userID, channelID);
    if (!existingSubscription) {
        throw new AppError('Subscription not found', 404);
    }
    await subscriptionRepo.deleteSubscription(existingSubscription.subID);
}

export async function listMySubscriptions(userID: bigint, page = 1, limit = 50) {
    const subs = await subscriptionRepo.listSubscriptionsWithChannelsByUser(userID, page, limit);
    return subs.map((sub) => sub.channel).filter(Boolean);
}
