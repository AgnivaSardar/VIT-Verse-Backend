import { Request, Response } from "express";
import * as CommentService from "./comment.service.js";
import { videoService } from "../videos/video.service.js";
import { CreateCommentRequest, UpdateCommentRequest } from "./comment.types.js";
import { toJSON } from "../../common/utils.js";
import { AppError } from "../../common/errors.js";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    };
}

export const createComment = asyncHandler(async (req: Request, res: Response) => {
    const input: CreateCommentRequest = req.body;

    // Resolve vidID robustly (it could be a number, numeric string, or public ID string)
    const rawVidID = String(input.vidID);
    const resolvedVidID = await videoService.resolveVideoID(rawVidID);
    if (!resolvedVidID) throw new AppError("Video not found", 404);
    input.vidID = resolvedVidID;

    // Resolve userID (ensure it's BigInt)
    input.userID = BigInt(input.userID);

    const created = await CommentService.createComment(input);
    res.status(201).json(toJSON(created));
});

export const getComment = asyncHandler(async (req: Request, res: Response) => {
    const commID = (() => {
  const { commID } = req.params;
  if (!commID) {
    throw new AppError("commID is required", 400);
  }
  return BigInt(commID);
})()
;
    const comment = await CommentService.getCommentByID(commID);
    res.json(toJSON(comment));
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
    const commID = (() => {
  const { commID } = req.params;
  if (!commID) {
    throw new AppError("commID is required", 400);
  }
  return BigInt(commID);
})()
;
    const input: UpdateCommentRequest = req.body;
    await CommentService.updateComment(commID, input);
    res.json({ message: "Comment updated successfully" });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const commID = (() => {
  const { commID } = req.params;
  if (!commID) {
    throw new AppError("commID is required", 400);
  }
  return BigInt(commID);
})()
;
    await CommentService.deleteComment(commID);
    res.json({ message: "Comment deleted successfully" });
}
);

export const CommentController = {
    createComment,
    getComment,
    updateComment,
    deleteComment,
}

export const listCommentsByVideo = asyncHandler(async (req: Request, res: Response) => {
    const vidIdParam = req.params.vidID;
    if (!vidIdParam) throw new AppError("vidID parameter is required", 400);
    const vidID = await videoService.resolveVideoID(vidIdParam);
    if (!vidID) throw new AppError("Video not found", 404);
    const list = await CommentService.listCommentsByVideoID(vidID);
    res.json(toJSON(list));
});
