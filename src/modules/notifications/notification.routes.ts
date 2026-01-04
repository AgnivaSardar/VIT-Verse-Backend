import { Router } from "express";
import { NotificationController } from "./notification.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();
const notificationController = NotificationController;
router.get("/user/:userID", requireAuth, notificationController.getNotificationsByUserID);
router.post("/:notifID/mark-as-read", requireAuth, notificationController.markNotificationAsRead);
router.post("/", requireAuth, notificationController.createNotification);
router.delete("/:notifID", requireAuth, notificationController.deleteNotification);
router.delete("/user/:userID", requireAuth, notificationController.deleteNotificationsByUserID);
router.get("/:notifID", notificationController.getNotificationByID);
router.put("/:notifID", requireAuth, notificationController.updateNotification);
router.get("/", notificationController.listNotifications);
export default router;
