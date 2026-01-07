import { Request, Response } from "express";
import * as likeService from "./like.service.js";
import { videoService } from "../videos/video.service.js";
import { CreateLikeRequest } from "./like.types.js";
import { toJSON } from "../../common/utils.js";
import { AppError } from "../../common/errors.js";
import * as notificationService from "../notifications/notification.service.js";
import { prisma } from "../../config/prisma.js";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    }
};

export const likeVideo = asyncHandler(async (req: Request, res: Response) => {
    const input: CreateLikeRequest = req.body;

    // Resolve vidID robustly
    const resolvedVidID = await videoService.resolveVideoID(String(input.vidID));
    if (!resolvedVidID) throw new AppError("Video not found", 404);
    input.vidID = resolvedVidID;

    // Ensure userID is BigInt
    input.userID = BigInt(input.userID);

    await likeService.likeVideo(input.userID, input.vidID);

    // Check and notify likes milestone
    try {
        const video = await videoService.getVideoById(resolvedVidID);
        if (video) {
            const channel = await prisma.channel.findUnique({ where: { channelID: video.channelID } });
            if (channel) {
                const likesCount = await likeService.getLikesCount(resolvedVidID);
                await notificationService.checkAndNotifyLikesMilestone(
                    channel.userID,
                    video.vidID,
                    video.title || 'Untitled',
                    likesCount
                );
            }
        }
    } catch (notifErr) {
        console.warn('Failed to send likes milestone notification:', notifErr);
    }

    res.status(201).json({ message: "Video liked successfully" });
});

export const unlikeVideo = asyncHandler(async (req: Request, res: Response) => {
    const input: CreateLikeRequest = req.body;

    // Resolve vidID robustly
    const resolvedVidID = await videoService.resolveVideoID(String(input.vidID));
    if (!resolvedVidID) throw new AppError("Video not found", 404);
    input.vidID = resolvedVidID;

    // Ensure userID is BigInt
    input.userID = BigInt(input.userID);

    await likeService.unlikeVideo(input.userID, input.vidID);
    res.json({ message: "Video unliked successfully" });
});

export const getLikesCount = asyncHandler(async (req: Request, res: Response) => {
    const vidIdParam = req.params.vidID;
    if (!vidIdParam) throw new AppError("vidID parameter is required", 400);
    const vidID = await videoService.resolveVideoID(vidIdParam);
    if (!vidID) throw new AppError("Video not found", 404);
    const count = await likeService.getLikesCount(vidID);
    res.json(toJSON({ vidID: vidID.toString(), count }));
});

export const hasUserLikedVideo = asyncHandler(async (req: Request, res: Response) => {
    const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
    const vidIdParam = req.params.vidID;
    if (!vidIdParam) throw new AppError("vidID parameter is required", 400);
    const vidID = await videoService.resolveVideoID(vidIdParam);
    if (!vidID) throw new AppError("Video not found", 404);
    const hasLiked = await likeService.hasUserLikedVideo(userID, vidID);
    res.json(toJSON({ userID: userID.toString(), vidID: vidID.toString(), hasLiked }));
});

export const LikeController = {
    likeVideo,
    unlikeVideo,
    getLikesCount,
    hasUserLikedVideo,
};
