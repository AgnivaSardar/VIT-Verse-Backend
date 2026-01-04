import { AppError } from '../../common/errors.js';
import * as likeRepo from './like.repository.js';
import { getIO } from "../realtime/socket.server.js";
import { socketEvents } from "../realtime/socket.handlers.js";
// Adjust the import based on the actual export from user.repository.ts
import { userRepository } from "../users/user.repository.js";
// If the export is named differently, for example 'UserRepository', use:
// import { UserRepository } from "../users/user.repository.js";

/**
 * Add a like to a video
 * @param userID - User ID
 * @param vidID - Video ID
 * @throws AppError if user already liked the video
 */
export async function likeVideo(userID: bigint, vidID: bigint): Promise<void> {
    // Check if the user has already liked the video
    const existingLike = await likeRepo.getLikeByUserAndContent(userID, vidID);
    if (existingLike) {
        throw new AppError('User has already liked this video', 400);
    }
    await likeRepo.createLike({
        userID,
        vidID,
    });

    // Emit socket event to broadcast new like
    try {
        const io = getIO();
        const user = await userRepository.getUserByID(userID);
        socketEvents.broadcastLike(io, vidID.toString(), user?.userName || "Unknown User");
    } catch (err) {
        console.log('Socket or user fetch error on like:', err);
    }
}

/**
 * Remove a like from a video
 * @param userID - User ID
 * @param vidID - Video ID
 * @throws AppError if like doesn't exist
 */
export async function unlikeVideo(userID: bigint, vidID: bigint): Promise<void> {
    const existingLike = await likeRepo.getLikeByUserAndContent(userID, vidID);
    if (!existingLike) {
        throw new AppError('User has not liked this video', 404);
    }
    await likeRepo.deleteLikeByUserAndContent(userID, vidID);
}

/**
 * Get the number of likes for a video
 * @param vidID - Video ID
 * @returns Number of likes
 */
export async function getLikesCount(vidID: bigint): Promise<number> {
    return await likeRepo.countLikesByContent(vidID);
}

/**
 * Check if a user has liked a video
 * @param userID - User ID
 * @param vidID - Video ID
 * @returns Boolean indicating if user has liked the video
 */
export async function hasUserLikedVideo(userID: bigint, vidID: bigint): Promise<boolean> {
    const like = await likeRepo.getLikeByUserAndContent(userID, vidID);
    return !!like;
}
