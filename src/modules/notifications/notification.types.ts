export interface Notification {
    notifID: bigint;
    userID: bigint;
    type: string;
    entityID: bigint | null;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

export interface CreateNotificationRequest {
    userID: bigint | null;
    type: string;
    entityID: bigint;
    message: string;
}

export interface NotificationResponse extends Notification {}

export interface NotificationListResponse {
    notifications: NotificationResponse[];
    totalNotifications: number;
}

export interface UpdateNotificationRequest {
    isRead?: boolean;
}

