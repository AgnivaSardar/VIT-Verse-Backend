import { AppError, ValidationError } from "../../common/errors";
import * as commentRepo from "./comment.repository";
import { CreateCommentRequest, UpdateCommentRequest } from "./comment.types";

export async function createComment(data: CreateCommentRequest): Promise<void> {
    await commentRepo.createComment(data);
}

export async function getCommentByID(commID: bigint) {
    const comment = await commentRepo.getCommentByID(commID);
    if (!comment) {
        throw new AppError("Comment not found", 404);
    }
    return comment;
}

export async function updateComment(commID: bigint, data: UpdateCommentRequest): Promise<void> {
    const comment = await commentRepo.getCommentByID(commID);
    if (!comment) {
        throw new AppError("Comment not found", 404);
    }
    await commentRepo.updateComment(commID, data);
}

export async function deleteComment(commID: bigint): Promise<void> {
    const comment = await commentRepo.getCommentByID(commID);
    if (!comment) {
        throw new AppError("Comment not found", 404);
    }
    await commentRepo.deleteComment(commID);
}

export function createCommentService(input: CreateCommentRequest) {
    throw new Error("Function not implemented.");
}

export function getCommentService(commID: bigint) {
    throw new Error("Function not implemented.");
}

export function updateCommentService(commID: bigint, input: UpdateCommentRequest) {
    throw new Error("Function not implemented.");
}

export function deleteCommentService(commID: bigint) {
    throw new Error("Function not implemented.");
}

