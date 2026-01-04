import { Router } from "express";
import { createTranscodeJob } from "./job.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
const router = Router();

router.post("/transcode", requireAuth, createTranscodeJob);
export default router;
