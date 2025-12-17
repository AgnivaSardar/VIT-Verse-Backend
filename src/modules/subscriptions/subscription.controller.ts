import { Request,Response } from "express";
import * as subscribeService from "./subscription.service";
import { CreateSubscriptionRequest, DeleteSubscriptionRequest } from "./subscription.types";

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
    res.status(201).json({ message: "Subscribed successfully" });
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
    const input: DeleteSubscriptionRequest = req.body;
    const channelID: bigint = BigInt(input.channelID);
    const userID: bigint = BigInt(input.userID);
    await subscribeService.unsubscribe(channelID, userID);
    res.json({ message: "Unsubscribed successfully" });
});

export const SubscriptionController = {
    subscribe,
    unsubscribe,
};