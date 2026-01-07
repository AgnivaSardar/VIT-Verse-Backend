import { Router } from "express";
import { NotificationController } from "./notification.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireSuperAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();
const notificationController = NotificationController;
router.get("/user/:userID", requireAuth, notificationController.getNotificationsByUserID);
router.get("/user/:userID/unread-count", requireAuth, notificationController.getUnreadCount);
router.post("/user/:userID/mark-all-read", requireAuth, notificationController.markAllAsRead);
router.post("/:notifID/mark-as-read", requireAuth, notificationController.markNotificationAsRead);
router.post("/", requireAuth, notificationController.createNotification);
router.post("/admin/send", requireSuperAdmin, notificationController.sendAdminNotification);
router.delete("/:notifID", requireAuth, notificationController.deleteNotification);
router.delete("/user/:userID", requireAuth, notificationController.deleteNotificationsByUserID);
router.get("/:notifID", notificationController.getNotificationByID);
router.put("/:notifID", requireAuth, notificationController.updateNotification);
router.get("/", notificationController.listNotifications);
export default router;
