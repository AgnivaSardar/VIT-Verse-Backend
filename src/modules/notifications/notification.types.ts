export interface Notification {
    notifID: bigint;
    userID: bigint;
    type: string;
    entityID: bigint | null;
    message: string;
    isRead: boolean;
    priority: string;
    category: string | null;
    metadata: any;
    createdBy: bigint | null;
    createdAt: Date;
}

export interface CreateNotificationRequest {
    userID: bigint | null;
    type: string;
    entityID?: bigint | null;
    message: string;
    priority?: string;
    category?: string;
    metadata?: any;
    createdBy?: bigint | null;
}

export interface NotificationResponse extends Notification {}

export interface NotificationListResponse {
    notifications: NotificationResponse[];
    totalNotifications: number;
}

export interface UpdateNotificationRequest {
    isRead?: boolean;
}

