import { Router } from "express";
import { UserController } from "./user.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { accountManagementLimiter } from "../../middlewares/rateLimiter.middleware.js";

const router = Router();
const userController = UserController;

router.post("/", requireAuth, accountManagementLimiter, userController.createUser);
router.get("/:userID", requireAuth, userController.getUser);
router.put("/:userID", requireAuth, accountManagementLimiter, userController.updateUser);
router.delete("/:userID", requireAuth, accountManagementLimiter, userController.deleteUser);
router.get("/", requireAuth, userController.listUsers);
router.post("/:userID/activate", requireAuth, accountManagementLimiter, userController.activateUser);
router.post("/:userID/deactivate", requireAuth, accountManagementLimiter, userController.deactivateUser);
export default router;
