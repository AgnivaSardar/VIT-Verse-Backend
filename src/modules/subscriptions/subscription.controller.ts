import { Request,Response } from "express";
import * as subscribeService from "./subscription.service.js";
import { CreateSubscriptionRequest, DeleteSubscriptionRequest } from "./subscription.types.js";
import { toJSON } from "../../common/utils.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as notificationService from "../notifications/notification.service.js";
import { prisma } from "../../config/prisma.js";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    }
}

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
    const input: CreateSubscriptionRequest = req.body;
    // Assuming input contains channelID and userID, and both are of type bigint or can be converted
    const channelID: bigint = BigInt(input.channelID);
    const userID: bigint = BigInt(input.userID);
    await subscribeService.subscribe(channelID, userID);

    // Check and notify subscriber milestone
    try {
        const channel = await prisma.channel.findUnique({ where: { channelID } });
        if (channel) {
            await notificationService.checkAndNotifySubscriberMilestone(channel.userID, Number(channel.channelSubscribers));
        }
    } catch (notifErr) {
        console.warn('Failed to send subscriber milestone notification:', notifErr);
    }

    res.status(201).json({ message: "Subscribed successfully" });
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
    const input: DeleteSubscriptionRequest = req.body;
    const channelID: bigint = BigInt(input.channelID);
    const userID: bigint = BigInt(input.userID);
    await subscribeService.unsubscribe(channelID, userID);
    res.json({ message: "Unsubscribed successfully" });
});

export const listMySubscriptions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userID = BigInt(String(req.user!.id));
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 50);
    const channels = await subscribeService.listMySubscriptions(userID, page, limit);
    res.json({ data: toJSON(channels) });
});

export const SubscriptionController = {
    subscribe,
    unsubscribe,
    listMySubscriptions,
};
