export interface Subscription {
    subID: bigint;
    userID: bigint;
    channelID: bigint;
    subscribedAt: Date;
}

export interface CreateSubscriptionRequest {
    userID: bigint;
    channelID: bigint;
}
export interface DeleteSubscriptionRequest {
    userID: bigint;
    channelID: bigint;
}
