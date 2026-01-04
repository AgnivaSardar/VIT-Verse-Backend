import { Router } from "express";
import { ReportController } from "./report.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();
const reportController = ReportController;

router.post("/", requireAuth, reportController.createReport);
router.get("/:reportID", reportController.getReport);
router.delete("/:reportID", requireAuth, reportController.deleteReport);
router.put("/:reportID", requireAuth, reportController.updateReport);
export default router;
