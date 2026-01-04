import { Request, Response } from "express";
import * as studentService from "./student.service.js";
import { CreateStudentRequest, UpdateStudentRequest } from "./student.types.js";
import { toJSON } from "../../common/utils.js";
import { AppError } from "../../common/errors.js";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: (err: any) => void) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

export const getStudent = asyncHandler(async (req: Request, res: Response) => {
  const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
  const student = await studentService.getStudentByID(userID);
  // Ensure all BigInt fields are serialized as strings
  res.json(toJSON(student));
});

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateStudentRequest = req.body;
  const created = await studentService.createStudent(input);
  // If service returns created entity with BigInt fields, wrap it too
  res.status(201).json(toJSON({
    message: "Student created successfully",
    student: created,
  }));
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
  const input: UpdateStudentRequest = req.body;
  const updated = await studentService.updateStudent(userID, input);
  res.json(toJSON({
    message: "Student updated successfully",
    student: updated,
  }));
});

export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
  await studentService.deleteStudent(userID);
  res.json({ message: "Student deleted successfully" });
});

export const StudentController = {
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};
