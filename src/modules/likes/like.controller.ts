import { Request, Response } from "express";
import * as likeService from "./like.service";
import { CreateLikeRequest } from "./like.types";
import { toJSON } from "../../common/utils";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    }
};

export const likeVideo = asyncHandler(async (req: Request, res: Response) => {
    const input: CreateLikeRequest = req.body;
    await likeService.likeVideo(input.userID, input.vidID);
    res.status(201).json({ message: "Video liked successfully" });
});

export const unlikeVideo = asyncHandler(async (req: Request, res: Response) => {
    const input: CreateLikeRequest = req.body;
    await likeService.unlikeVideo(input.userID, input.vidID);
    res.json({ message: "Video unliked successfully" });
});

export const getLikesCount = asyncHandler(async (req: Request, res: Response) => {
    const vidID = BigInt(req.params.vidID);
    const count = await likeService.getLikesCount(vidID);
    res.json(toJSON({ vidID, count }));
});

export const hasUserLikedVideo = asyncHandler(async (req: Request, res: Response) => {
    const userID = BigInt(req.params.userID);
    const vidID = BigInt(req.params.vidID);
    const hasLiked = await likeService.hasUserLikedVideo(userID, vidID);
    res.json(toJSON({ userID, vidID, hasLiked }));
}
);

export const LikeController = {
    likeVideo,
    unlikeVideo,
    getLikesCount,
    hasUserLikedVideo,
};