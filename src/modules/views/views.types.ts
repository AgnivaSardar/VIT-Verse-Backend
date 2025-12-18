export interface View {
    viewID: bigint;
    userID: bigint;
    vidID: bigint;
    watchedAt: Date;
    watchTime: number; // in seconds
    ipAddress: string | null;
    userAgent: string;
}

export interface CreateViewRequest {
    userID: bigint;
    vidID: bigint;
    watchTime: number; // in seconds
    ipAddress: string | null;
    userAgent: string;
}
export interface UpdateChannelRequest {
    channelName?: string;
    channelDescription?: string;
    channelType?: 'public' | 'private' | 'protected';
    channelSubscribers?: bigint; // Change to single bigint
    isPremium?: boolean;
}
export interface ViewResponse extends View {}

export interface ViewListResponse {
    views: ViewResponse[];
    totalViews: number;
}
