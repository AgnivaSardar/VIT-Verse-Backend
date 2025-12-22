import { AppError } from "../../common/errors";
import * as subscriptionRepo from "./subscription.repository";
import { getIO } from "../realtime/socket.server";
import { socketEvents } from "../realtime/socket.handlers";
import * as channelService from "../channels/channel.service";

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
        socketEvents.notifySubscription(io, userID.toString(), channelID.toString(), channel.channelName);
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