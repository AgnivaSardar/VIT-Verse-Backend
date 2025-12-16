import { Router } from "express";
import { CommentController } from "./comment.controller";

const router = Router();
const commentController = CommentController;

router.post("/", commentController.createComment);
router.get("/:commID", commentController.getComment);
router.put("/:commID", commentController.updateComment);
router.delete("/:commID", commentController.deleteComment);
export default router;
