import { Router } from "express";
import { ViewsController } from "./views.controller";

const router = Router();
router.post("/", ViewsController.createView);
router.get("/:viewID", ViewsController.getView);
router.put("/:viewID", ViewsController.updateView);
router.delete("/:viewID", ViewsController.deleteView);
router.get("/", ViewsController.listViews);
export default router;
