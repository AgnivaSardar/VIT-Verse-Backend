import { AppError, ValidationError } from "../../common/errors";
import * as commentRepo from "./comment.repository";
import { getIO } from "../realtime/socket.server";
import { socketEvents } from "../realtime/socket.handlers";
import { CreateCommentRequest, UpdateCommentRequest } from "./comment.types";
import { userRepository } from "../users/user.repository";

export async function createComment(data: CreateCommentRequest) {
    const comment = await commentRepo.createComment(data);
    
    // Emit socket event to broadcast new comment
    try {
        const io = getIO();
        const user = await userRepository.getUserByID(data.userID);
        socketEvents.broadcastComment(io, data.vidID.toString(), {
            commentID: comment.commID.toString(),
            userName: user?.userName || "Unknown User",
            text: data.description,
        });
    } catch (err) {
        console.log('Socket or user fetch error on comment:', err);
    }
    return comment;
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

export async function listCommentsByVideoID(vidID: bigint) {
    const comments = await commentRepo.listCommentsByVideoID(vidID);
    // Map userName from joined user object
    return comments.map((c: any) => ({
        ...c,
        userName: c.user?.userName || c.userName || "Unknown User",
    }));
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

