import { Router } from "express";
import { UserController } from "./user.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { accountManagementLimiter } from "../../middlewares/rateLimiter.middleware";

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