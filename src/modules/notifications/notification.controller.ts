import { Request, Response } from "express";
import * as notificationService from "./notification.service.js";
import { UpdateNotificationRequest } from "./notification.types.js";
import { ValidationError, AppError } from "../../common/errors.js";
import { toJSON } from "../../common/utils.js";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    }
}

export const getNotificationsByUserID = asyncHandler(async (req: Request, res: Response) => {
    const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
    const notifications = await notificationService.getNotificationsByUserID(userID);
    res.json(toJSON(notifications));
}
);

export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
    const notifID = (() => {
  const { notifID } = req.params;
  if (!notifID) {
    throw new AppError("notifID is required", 400);
  }
  return BigInt(notifID);
})()
;
    await notificationService.markNotificationAsRead(notifID);
    res.json({ message: "Notification marked as read successfully" });
}
);

export const createNotification = asyncHandler(async (req: Request, res: Response) => {
    const { userID, type, entityID, message } = req.body ?? {};

    const allowedTypes = ["message", "subscribe_request", "system_alert"] as const;

    if (userID == null || entityID == null || typeof message !== "string" || !allowedTypes.includes(type)) {
        throw new ValidationError("Invalid notification payload", {
            required: { userID: "bigint|string|number", entityID: "bigint|string|number", type: allowedTypes, message: "string" },
        });
    }

    const data = {
        userID: typeof userID === "bigint" ? userID : BigInt(userID),
        entityID: typeof entityID === "bigint" ? entityID : BigInt(entityID),
        type,
        message,
    } as const;

    await notificationService.createNotification(data);
    res.status(201).json({ message: "Notification created successfully" });
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const notifID = (() => {
  const { notifID } = req.params;
  if (!notifID) {
    throw new AppError("notifID is required", 400);
  }
  return BigInt(notifID);
})()
;
    await notificationService.deleteNotification(notifID);
    res.json({ message: "Notification deleted successfully" });
}
);

export const deleteNotificationsByUserID = asyncHandler(async (req: Request, res: Response) => {
    const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
    await notificationService.deleteNotificationsByUserID(userID);
    res.json({ message: "All notifications for user deleted successfully" });
}
);

export const getNotificationByID = asyncHandler(async (req: Request, res: Response) => {
    const notifID = (() => {
  const { notifID } = req.params;
  if (!notifID) {
    throw new AppError("notifID is required", 400);
  }
  return BigInt(notifID);
})()
;
    const notification = await notificationService.getNotificationByID(notifID);
    res.json(notification);
}
);

export const updateNotification = asyncHandler(async (req: Request, res: Response) => {
    const notifID = (() => {
  const { notifID } = req.params;
  if (!notifID) {
    throw new AppError("notifID is required", 400);
  }
  return BigInt(notifID);
})()
;
    const input: UpdateNotificationRequest = req.body;
    await notificationService.updateNotification(notifID, input);
    res.json({ message: "Notification updated successfully" });
});

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await notificationService.listNotifications(page, limit);
    res.json(result);
}
);

export const NotificationController = {
    getNotificationsByUserID,
    markNotificationAsRead,
    createNotification,
    deleteNotification,
    deleteNotificationsByUserID,
    getNotificationByID,
    updateNotification,
    listNotifications,
};
