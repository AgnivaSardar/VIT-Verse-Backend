import { Router } from "express";
import { LikeController } from "./like.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();
const likeController = LikeController;

router.post("/", requireAuth, likeController.likeVideo);
router.delete("/", requireAuth, likeController.unlikeVideo);
router.get("/count/:vidID", likeController.getLikesCount);
router.get("/hasLiked/user/:userID/video/:vidID", likeController.hasUserLikedVideo);
export default router;
