import { Router } from "express";
import { UserController } from "./user.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();
const userController = UserController;

router.post("/", requireAuth, userController.createUser);
router.get("/:userID", userController.getUser);
router.put("/:userID", requireAuth, userController.updateUser);
router.delete("/:userID", requireAuth, userController.deleteUser);
router.get("/", userController.listUsers);
router.post("/:userID/activate", requireAuth, userController.activateUser);
router.post("/:userID/deactivate", requireAuth, userController.deactivateUser);
export default router;