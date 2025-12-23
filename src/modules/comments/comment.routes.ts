import { Router } from "express";
import { CommentController, listCommentsByVideo } from "./comment.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();
const commentController = CommentController;

router.post("/", requireAuth, commentController.createComment);
router.get("/:commID", commentController.getComment);
router.get("/video/:vidID", listCommentsByVideo);
router.put("/:commID", requireAuth, commentController.updateComment);
router.delete("/:commID", requireAuth, commentController.deleteComment);
export default router;
