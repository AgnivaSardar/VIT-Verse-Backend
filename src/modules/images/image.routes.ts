import { Router } from "express";

import { ImageController } from "./image.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();
const imageController = ImageController;
router.post("/", requireAuth, imageController.createImage);
router.get("/:imgID", imageController.getImage);
router.put("/:imgID", requireAuth, imageController.updateImage);
router.delete("/:imgID", requireAuth, imageController.deleteImage);
export default router;
