import { Router } from "express";
import { StudentController } from "./student.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();
const studentController = StudentController;

router.post("/", requireAuth, studentController.createStudent);
router.get("/:userID", studentController.getStudent);
router.put("/:userID", requireAuth, studentController.updateStudent);
router.delete("/:userID", requireAuth, studentController.deleteStudent);
export default router;
