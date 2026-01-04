export interface VideoStats {
    vidID: bigint;
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateVideoStatsRequest {
    vidID: bigint;
    viewsCount?: number;
    likesCount?: number;
    commentsCount?: number;
    sharesCount?: number;
}
export type UpdateVideoStatsRequest = Partial<Omit<VideoStats, 'vidID' | 'createdAt'>>;
