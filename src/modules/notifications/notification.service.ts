import { AppError } from '../../common/errors.js';
import * as notificationRepo from './notification.repository.js';
import { getIO } from '../realtime/socket.server.js';
import { socketEvents } from '../realtime/socket.handlers.js';
import { Notification } from './notification.types.js';

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
    type: string;
    entityID?: bigint | null;
    message: string;
    priority?: string;
    category?: string;
    metadata?: any;
    createdBy?: bigint | null;
}): Promise<void> {
    const notification = await notificationRepo.createNotification(data);
    
    // Emit socket event to notify user in real-time
    try {
        const io = getIO();
        socketEvents.notifyUser(io, data.userID.toString(), {
            notifID: notification.notifID.toString(),
            message: data.message,
            type: data.type,
            priority: data.priority || 'normal',
        });
    } catch (err) {
        // Socket not initialized yet, continue gracefully
        console.log('Socket.io not available for notification:', err);
    }
}

// Helper: Upload success notification
export async function notifyUploadSuccess(uploaderID: bigint, videoID: bigint, videoTitle: string): Promise<void> {
    await createNotification({
        userID: uploaderID,
        type: 'upload_success',
        entityID: videoID,
        message: `Video "${videoTitle}" uploaded successfully and is now processing`,
        priority: 'normal',
        category: 'system',
        metadata: { videoTitle, stage: 'completed' },
    });
}

// Helper: Upload failed notification
export async function notifyUploadFailed(uploaderID: bigint, stage: 'client' | 'server' | 'storage', error: string): Promise<void> {
    const stageMessages = {
        client: 'Upload failed on your device. Please check your connection and try again.',
        server: 'Upload failed while processing on the server. Please try again later.',
        storage: 'Upload failed while saving to storage. Please contact support if this persists.',
    };
    
    await createNotification({
        userID: uploaderID,
        type: 'upload_failed',
        message: stageMessages[stage],
        priority: 'high',
        category: 'system',
        metadata: { stage, error },
    });
}

// Helper: Video processing complete
export async function notifyVideoProcessed(uploaderID: bigint, videoID: bigint, videoTitle: string): Promise<void> {
    await createNotification({
        userID: uploaderID,
        type: 'video_processed',
        entityID: videoID,
        message: `Your video "${videoTitle}" has finished processing and is now live!`,
        priority: 'normal',
        category: 'system',
        metadata: { videoTitle },
    });
}

// Helper: New comment notification
export async function notifyNewComment(videoOwnerID: bigint, commenterID: bigint, commenterName: string, videoID: bigint, videoTitle: string, commentPreview: string): Promise<void> {
    const preview = commentPreview.length > 50 ? commentPreview.substring(0, 50) + '...' : commentPreview;
    
    await createNotification({
        userID: videoOwnerID,
        type: 'comment',
        entityID: videoID,
        message: `${commenterName} commented on "${videoTitle}": "${preview}"`,
        priority: 'normal',
        category: 'engagement',
        metadata: { commenterName, commenterID: commenterID.toString(), videoTitle, commentPreview },
    });
}

// Helper: Comment reply notification
export async function notifyCommentReply(originalCommenterID: bigint, replierName: string, videoTitle: string, replyPreview: string): Promise<void> {
    const preview = replyPreview.length > 50 ? replyPreview.substring(0, 50) + '...' : replyPreview;
    
    await createNotification({
        userID: originalCommenterID,
        type: 'reply',
        message: `${replierName} replied to your comment on "${videoTitle}": "${preview}"`,
        priority: 'normal',
        category: 'engagement',
        metadata: { replierName, videoTitle, replyPreview },
    });
}

// Helper: Mention notification
export async function notifyMention(mentionedUserID: bigint, mentionerName: string, videoTitle: string, context: string): Promise<void> {
    await createNotification({
        userID: mentionedUserID,
        type: 'mention',
        message: `${mentionerName} mentioned you in a comment on "${videoTitle}"`,
        priority: 'normal',
        category: 'engagement',
        metadata: { mentionerName, videoTitle, context },
    });
}

// Milestone tracking helper
const MILESTONE_LEVELS = [1, 100, 200, 300, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 500000, 1000000];

function isMilestone(count: number): boolean {
    return MILESTONE_LEVELS.includes(count);
}

// Helper: Subscriber milestone notification
export async function checkAndNotifySubscriberMilestone(channelOwnerID: bigint, subscriberCount: number): Promise<void> {
    if (isMilestone(subscriberCount)) {
        await createNotification({
            userID: channelOwnerID,
            type: 'milestone',
            message: `🎉 Congratulations! Your channel reached ${subscriberCount.toLocaleString()} subscribers!`,
            priority: 'high',
            category: 'milestone',
            metadata: { milestoneType: 'subscribers', count: subscriberCount },
        });
    }
}

// Helper: Video views milestone notification
export async function checkAndNotifyViewsMilestone(videoOwnerID: bigint, videoID: bigint, videoTitle: string, viewsCount: number): Promise<void> {
    if (isMilestone(viewsCount)) {
        await createNotification({
            userID: videoOwnerID,
            type: 'milestone',
            entityID: videoID,
            message: `🔥 Your video "${videoTitle}" reached ${viewsCount.toLocaleString()} views!`,
            priority: 'normal',
            category: 'milestone',
            metadata: { milestoneType: 'views', count: viewsCount, videoTitle },
        });
    }
}

// Helper: Video likes milestone notification
export async function checkAndNotifyLikesMilestone(videoOwnerID: bigint, videoID: bigint, videoTitle: string, likesCount: number): Promise<void> {
    if (isMilestone(likesCount)) {
        await createNotification({
            userID: videoOwnerID,
            type: 'milestone',
            entityID: videoID,
            message: `👍 Your video "${videoTitle}" reached ${likesCount.toLocaleString()} likes!`,
            priority: 'normal',
            category: 'milestone',
            metadata: { milestoneType: 'likes', count: likesCount, videoTitle },
        });
    }
}

// Helper: Video comments milestone notification
export async function checkAndNotifyCommentsMilestone(videoOwnerID: bigint, videoID: bigint, videoTitle: string, commentsCount: number): Promise<void> {
    if (isMilestone(commentsCount)) {
        await createNotification({
            userID: videoOwnerID,
            type: 'milestone',
            entityID: videoID,
            message: `💬 Your video "${videoTitle}" reached ${commentsCount.toLocaleString()} comments!`,
            priority: 'normal',
            category: 'milestone',
            metadata: { milestoneType: 'comments', count: commentsCount, videoTitle },
        });
    }
}

// Helper: Admin sends notification to user/channel
export async function sendAdminNotification(adminID: bigint, recipientUserID: bigint, message: string, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'): Promise<void> {
    await createNotification({
        userID: recipientUserID,
        type: 'admin_message',
        message,
        priority,
        category: 'admin',
        createdBy: adminID,
    });
}

export async function getUnreadCount(userID: bigint): Promise<number> {
    return notificationRepo.getUnreadCount(userID);
}

export async function markAllAsRead(userID: bigint): Promise<void> {
    await notificationRepo.markAllAsRead(userID);
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


