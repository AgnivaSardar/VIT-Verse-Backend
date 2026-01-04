import { prisma } from '../../config/prisma.js';

export async function getNotificationByID(id: bigint) {
    return prisma.notifications.findUnique({
        where: { notifID: id },
    });
}

export async function getNotificationsByUserID(userID: bigint) {
    return prisma.notifications.findMany({
        where: { userID: userID },
        orderBy: { createdAt: 'desc' },
    });
}

export async function createNotification(data: {
    userID: bigint;
    type: 'message' | 'subscribe_request' | 'system_alert';
    entityID: bigint;
    message: string;
}) {
    return prisma.notifications.create({
        data: {
            userID: data.userID,
            type: data.type,
            entityID: data.entityID,
            message: data.message,
            isRead: false,
        },
    });
}

export async function updateNotification(id: bigint, data: { isRead?: boolean }) {
    return prisma.notifications.update({
        where: { notifID: id },
        data: data,
    });
}

export async function deleteNotification(id: bigint) {
    return prisma.notifications.delete({
        where: { notifID: id },
    });
}

export async function deleteNotificationsByUserID(userID: bigint) {
    return prisma.notifications.deleteMany({
        where: { userID: userID },
    });
}

export async function listNotifications(offset: number, limit: number) {
    return prisma.notifications.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
    });
}

export async function countNotifications() {
    return prisma.notifications.count();
}

