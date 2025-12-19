import { Router } from "express";
import { TeacherController } from "./teacher.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();
const teacherController = TeacherController;

router.post("/", requireAuth, teacherController.createTeacher);
router.get("/:userID", teacherController.getTeacher);
router.delete("/:userID", requireAuth, teacherController.deleteTeacher);
router.put("/:userID", requireAuth, teacherController.updateTeacher);
router.get("/", teacherController.listTeachers);
export default router;
