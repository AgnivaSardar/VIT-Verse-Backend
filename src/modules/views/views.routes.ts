import { Router } from "express";
import { ViewsController } from "./views.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();
router.post("/", requireAuth, ViewsController.createView);
router.get("/:viewID", ViewsController.getView);
router.put("/:viewID", requireAuth, ViewsController.updateView);
router.delete("/:viewID", requireAuth, ViewsController.deleteView);
router.get("/", ViewsController.listViews);
export default router;
