import { Router } from "express";
import { createTranscodeJob } from "./job.controller";
const router = Router();

router.post("/transcode", createTranscodeJob);
export default router;