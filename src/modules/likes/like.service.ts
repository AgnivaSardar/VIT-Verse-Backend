import { AppError } from '../../common/errors';
import * as likeRepo from './like.repository';

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
