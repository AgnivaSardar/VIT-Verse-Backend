import { Request, Response } from "express";
import * as videoStatsService from "./videostats.service.js";
import { videoService } from "../videos/video.service.js";
import { toJSON } from "../../common/utils.js";
import { AppError } from "../../common/errors.js";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    }
}

export const getVideoStats = asyncHandler(async (req: Request, res: Response) => {
    const vidIdParam = req.params.vidID;
    if (!vidIdParam) throw new AppError("vidID parameter is required", 400);
    const vidID = await videoService.resolveVideoID(vidIdParam);
    if (!vidID) throw new AppError("Video not found", 404);
    const stats = await videoStatsService.getVideoStatsByVidID(vidID);
    res.json(toJSON(stats));
});

export const listVideoStats = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await videoStatsService.listVideoStats(page, limit);
    res.json(toJSON(result));
});

export const incrementViewsCount = asyncHandler(async (req: Request, res: Response) => {
    const vidIdParam = req.params.vidID;
    if (!vidIdParam) throw new AppError("vidID parameter is required", 400);
    const vidID = await videoService.resolveVideoID(vidIdParam);
    if (!vidID) throw new AppError("Video not found", 404);
    const userID = (req as any).user?.id ? BigInt((req as any).user.id) : undefined;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const result = await videoStatsService.incrementViewsCount(vidID, userID, ipAddress, userAgent);
    res.json({
        message: result ? "Views count incremented successfully" : "View already counted",
        incremented: !!result
    });
});

export const incrementLikesCount = asyncHandler(async (req: Request, res: Response) => {
    const vidIdParam = req.params.vidID;
    if (!vidIdParam) throw new AppError("vidID parameter is required", 400);
    const vidID = await videoService.resolveVideoID(vidIdParam);
    if (!vidID) throw new AppError("Video not found", 404);
    await videoStatsService.incrementLikesCount(vidID);
    res.json({ message: "Likes count incremented successfully" });
});

export const decrementLikesCount = asyncHandler(async (req: Request, res: Response) => {
    const vidIdParam = req.params.vidID;
    if (!vidIdParam) throw new AppError("vidID parameter is required", 400);
    const vidID = await videoService.resolveVideoID(vidIdParam);
    if (!vidID) throw new AppError("Video not found", 404);
    await videoStatsService.decrementLikesCount(vidID);
    res.json({ message: "Likes count decremented successfully" });
});

export const incrementCommentsCount = asyncHandler(async (req: Request, res: Response) => {
    const vidIdParam = req.params.vidID;
    if (!vidIdParam) throw new AppError("vidID parameter is required", 400);
    const vidID = await videoService.resolveVideoID(vidIdParam);
    if (!vidID) throw new AppError("Video not found", 404);
    await videoStatsService.incrementCommentsCount(vidID);
    res.json({ message: "Comments count incremented successfully" });
});

export const decrementCommentsCount = asyncHandler(async (req: Request, res: Response) => {
    const vidIdParam = req.params.vidID;
    if (!vidIdParam) throw new AppError("vidID parameter is required", 400);
    const vidID = await videoService.resolveVideoID(vidIdParam);
    if (!vidID) throw new AppError("Video not found", 404);
    await videoStatsService.decrementCommentsCount(vidID);
    res.json({ message: "Comments count decremented successfully" });
});

export const incrementSharesCount = asyncHandler(async (req: Request, res: Response) => {
    const vidIdParam = req.params.vidID;
    if (!vidIdParam) throw new AppError("vidID parameter is required", 400);
    const vidID = await videoService.resolveVideoID(vidIdParam);
    if (!vidID) throw new AppError("Video not found", 404);
    await videoStatsService.incrementSharesCount(vidID);
    res.json({ message: "Shares count incremented successfully" });
});

export const decrementSharesCount = asyncHandler(async (req: Request, res: Response) => {
    const vidIdParam = req.params.vidID;
    if (!vidIdParam) throw new AppError("vidID parameter is required", 400);
    const vidID = await videoService.resolveVideoID(vidIdParam);
    if (!vidID) throw new AppError("Video not found", 404);
    await videoStatsService.decrementSharesCount(vidID);
    res.json({ message: "Shares count decremented successfully" });
});

export const VideoStatsController = {
    getVideoStats,
    listVideoStats,
    incrementViewsCount,
    incrementLikesCount,
    decrementLikesCount,
    incrementCommentsCount,
    decrementCommentsCount,
    incrementSharesCount,
    decrementSharesCount,
};
