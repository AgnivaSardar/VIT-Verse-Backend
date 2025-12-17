import { Router } from "express";
import { LikeController } from "./like.controller";

const router = Router();
const likeController = LikeController;

router.post("/", likeController.likeVideo);
router.delete("/", likeController.unlikeVideo);
router.get("/count/:vidID", likeController.getLikesCount);
router.get("/hasLiked/user/:userID/video/:vidID", likeController.hasUserLikedVideo);
export default router;
