import { Router } from "express";
import { CommentController } from "./comment.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();
const commentController = CommentController;

router.post("/", requireAuth, commentController.createComment);
router.get("/:commID", commentController.getComment);
router.put("/:commID", requireAuth, commentController.updateComment);
router.delete("/:commID", requireAuth, commentController.deleteComment);
export default router;
