import { AppError } from "../../common/errors";
import * as videoStatsRepo from "./videostats.repository";
import { VideoStats } from "./videostats.types";

export async function getVideoStatsByVidID(vidID: bigint): Promise<VideoStats> {
  const stats = await videoStatsRepo.getVideoStatsByVidID(vidID);
    if (!stats) {
        throw new AppError("Video stats not found", 404);
    }
    return {
        ...stats,
        vidID: stats.vidID,
        viewsCount: typeof stats.viewsCount === "bigint" ? Number(stats.viewsCount) : stats.viewsCount,
        likesCount: typeof stats.likesCount === "bigint" ? Number(stats.likesCount) : stats.likesCount,
        commentsCount: typeof stats.commentsCount === "bigint" ? Number(stats.commentsCount) : stats.commentsCount,
        sharesCount: typeof stats.sharesCount === "bigint" ? Number(stats.sharesCount) : stats.sharesCount,
    };
}

export async function listVideoStats(page: number, limit: number) {
  return videoStatsRepo.listVideoStats(page, limit);
}

export async function incrementViewsCount(vidID: bigint) {
  return videoStatsRepo.incrementViewsCount(vidID);
}

export async function incrementLikesCount(vidID: bigint) {
  return videoStatsRepo.incrementLikesCount(vidID);
}

export async function decrementLikesCount(vidID: bigint) {
  return videoStatsRepo.decrementLikesCount(vidID);
}

export async function incrementCommentsCount(vidID: bigint) {
  return videoStatsRepo.incrementCommentsCount(vidID);
}

export async function decrementCommentsCount(vidID: bigint) {
  return videoStatsRepo.decrementCommentsCount(vidID);
}

export async function incrementSharesCount(vidID: bigint) {
  return videoStatsRepo.incrementSharesCount(vidID);
}

export async function decrementSharesCount(vidID: bigint) {
  return videoStatsRepo.decrementSharesCount(vidID);
}
