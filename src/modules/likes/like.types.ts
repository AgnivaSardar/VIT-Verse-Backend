export interface CreateLikeRequest {
    userID: bigint;
    vidID: bigint;
}

export interface LikesCountResponse {
    vidID: bigint;
    count: number;
}
