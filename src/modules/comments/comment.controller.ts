import { Request, Response } from "express";
import * as CommentService from "./comment.service";
import { CreateCommentRequest, UpdateCommentRequest } from "./comment.types";
import { toJSON } from "../../common/utils";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    };
}

export const createComment = asyncHandler(async (req: Request, res: Response) => {
    const input: CreateCommentRequest = req.body;
    await CommentService.createComment(input);
    res.status(201).json({ message: "Comment created successfully" });
}
);

export const getComment = asyncHandler(async (req: Request, res: Response) => {
    const commID = BigInt(req.params.commID);
    const comment = await CommentService.getCommentByID(commID);
    res.json(toJSON(comment));
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
    const commID = BigInt(req.params.commID);
    const input: UpdateCommentRequest = req.body;
    await CommentService.updateComment(commID, input);
    res.json({ message: "Comment updated successfully" });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const commID = BigInt(req.params.commID);
    await CommentService.deleteComment(commID);
    res.json({ message: "Comment deleted successfully" });
}
);

export const CommentController ={
    createComment,
    getComment,
    updateComment,
    deleteComment,
}