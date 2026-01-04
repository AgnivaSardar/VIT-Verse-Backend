import { Router } from "express";
import { VideoStatsController } from "./videostats.controller.js";
import { requireAuth, optionalAuth } from "../../middlewares/auth.middleware.js";

const router = Router();
const videoStatsController = VideoStatsController;

router.get("/:vidID", videoStatsController.getVideoStats);
router.get("/", videoStatsController.listVideoStats);
router.post("/:vidID/increment-views", optionalAuth as any, videoStatsController.incrementViewsCount);
router.post("/:vidID/increment-likes", requireAuth, videoStatsController.incrementLikesCount);
router.post("/:vidID/decrement-likes", requireAuth, videoStatsController.decrementLikesCount);
router.post("/:vidID/increment-comments", requireAuth, videoStatsController.incrementCommentsCount);
router.post("/:vidID/decrement-comments", requireAuth, videoStatsController.decrementCommentsCount);
router.post("/:vidID/increment-shares", requireAuth, videoStatsController.incrementSharesCount);
router.post("/:vidID/decrement-shares", requireAuth, videoStatsController.decrementSharesCount);
export default router;
