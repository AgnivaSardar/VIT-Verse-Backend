import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();
const userController = UserController;

router.post("/", userController.createUser);
router.get("/:userID", userController.getUser);
router.put("/:userID", userController.updateUser);
router.delete("/:userID", userController.deleteUser);
router.get("/", userController.listUsers);
router.post("/:userID/activate", userController.activateUser);
router.post("/:userID/deactivate", userController.deactivateUser);
export default router;