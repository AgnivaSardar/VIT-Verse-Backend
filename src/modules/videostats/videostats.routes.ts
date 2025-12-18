import { Router } from "express";
import { VideoStatsController } from "./videostats.controller";

const router = Router();
const videoStatsController = VideoStatsController;

router.get("/:vidID", videoStatsController.getVideoStats);
router.get("/", videoStatsController.listVideoStats);
router.post("/:vidID/increment-views", videoStatsController.incrementViewsCount);
router.post("/:vidID/increment-likes", videoStatsController.incrementLikesCount);
router.post("/:vidID/decrement-likes", videoStatsController.decrementLikesCount);
router.post("/:vidID/increment-comments", videoStatsController.incrementCommentsCount);
router.post("/:vidID/decrement-comments", videoStatsController.decrementCommentsCount);
router.post("/:vidID/increment-shares", videoStatsController.incrementSharesCount);
router.post("/:vidID/decrement-shares", videoStatsController.decrementSharesCount);
export default router;