import { Router } from "express";
import { StudentController } from "./student.controller";

const router = Router();
const studentController = StudentController;

router.post("/", studentController.createStudent);
router.get("/:userID", studentController.getStudent);
router.put("/:userID", studentController.updateStudent);
router.delete("/:userID", studentController.deleteStudent);
export default router;