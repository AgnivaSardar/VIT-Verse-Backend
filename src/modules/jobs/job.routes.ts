import { Router } from "express";
import { createTranscodeJob } from "./job.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
const router = Router();

router.post("/transcode", requireAuth, createTranscodeJob);
export default router;