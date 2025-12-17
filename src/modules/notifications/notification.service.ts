import { AppError } from '../../common/errors';
import * as notificationRepo from './notification.repository';
import { Notification } from './notification.types';

export async function getNotificationsByUserID(userID: bigint): Promise<Notification[]> {
    return notificationRepo.getNotificationsByUserID(userID);
}

export async function markNotificationAsRead(notifID: bigint): Promise<void> {
    const notification = await notificationRepo.getNotificationByID(notifID);
    if (!notification) {
        throw new AppError('Notification not found', 404);
    }
    await notificationRepo.updateNotification(notifID, { isRead: true });
}

export async function createNotification(data: {
    userID: bigint;
    type: 'message' | 'subscribe_request' | 'system_alert';
    entityID: bigint;
    message: string;
}): Promise<void> {
    await notificationRepo.createNotification(data);
}

export async function deleteNotification(notifID: bigint): Promise<void> {
    const notification = await notificationRepo.getNotificationByID(notifID);
    if (!notification) {
        throw new AppError('Notification not found', 404);
    }
    await notificationRepo.deleteNotification(notifID);
}

export async function deleteNotificationsByUserID(userID: bigint): Promise<void> {
    await notificationRepo.deleteNotificationsByUserID(userID);
}

export async function getNotificationByID(notifID: bigint): Promise<Notification> {
    const notification = await notificationRepo.getNotificationByID(notifID);
    if (!notification) {
        throw new AppError('Notification not found', 404);
    }
    return notification;
}

export async function updateNotification(notifID: bigint, data: { isRead?: boolean }): Promise<void> {
    const notification = await notificationRepo.getNotificationByID(notifID);
    if (!notification) {
        throw new AppError('Notification not found', 404);
    }
    await notificationRepo.updateNotification(notifID, data);
}

export async function listNotifications(page: number, limit: number): Promise<{ notifications: Notification[]; totalNotifications: number }> {
    const offset = (page - 1) * limit;
    const [notifications, totalNotifications] = await Promise.all([
        notificationRepo.listNotifications(offset, limit),
        notificationRepo.countNotifications(),
    ]);
    return { notifications, totalNotifications };
}


