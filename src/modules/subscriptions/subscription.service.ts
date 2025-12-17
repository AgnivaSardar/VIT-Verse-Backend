import { AppError } from "../../common/errors";
import * as subscriptionRepo from "./subscription.repository";

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
}

export async function unsubscribe(channelID: bigint, userID: bigint) {
    // Check if the subscription exists
    const existingSubscription = await subscriptionRepo.getSubscriptionByUserAndChannel(userID, channelID);
    if (!existingSubscription) {
        throw new AppError('Subscription not found', 404);
    }
    await subscriptionRepo.deleteSubscription(existingSubscription.subID);
}