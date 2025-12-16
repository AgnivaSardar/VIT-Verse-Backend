import { Router } from "express";

import { ImageController } from "./image.controller";

const router = Router();
const imageController = ImageController;
router.post("/", imageController.createImage);
router.get("/:imgID", imageController.getImage);
router.put("/:imgID", imageController.updateImage);
router.delete("/:imgID", imageController.deleteImage);
export default router;
