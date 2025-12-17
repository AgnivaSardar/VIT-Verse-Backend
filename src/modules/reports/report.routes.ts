import { Router } from "express";
import { ReportController } from "./report.controller";

const router = Router();
const reportController = ReportController;

router.post("/", reportController.createReport);
router.get("/:reportID", reportController.getReport);
router.delete("/:reportID", reportController.deleteReport);
router.put("/:reportID", reportController.updateReport);
export default router;