import { Router } from "express";
import { NotificationController } from "./notification.controller";

const router = Router();
const notificationController = NotificationController;
router.get("/user/:userID", notificationController.getNotificationsByUserID);
router.post("/:notifID/mark-as-read", notificationController.markNotificationAsRead);
router.post("/", notificationController.createNotification);
router.delete("/:notifID", notificationController.deleteNotification);
router.delete("/user/:userID", notificationController.deleteNotificationsByUserID);
router.get("/:notifID", notificationController.getNotificationByID);
router.put("/:notifID", notificationController.updateNotification);
router.get("/", notificationController.listNotifications);
export default router;
