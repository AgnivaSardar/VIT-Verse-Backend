import { Router } from "express";
import { TeacherController } from "./teacher.controller";

const router = Router();
const teacherController = TeacherController;

router.post("/", teacherController.createTeacher);
router.get("/:userID", teacherController.getTeacher);
router.delete("/:userID", teacherController.deleteTeacher);
router.put("/:userID", teacherController.updateTeacher);
router.get("/", teacherController.listTeachers);
export default router;
