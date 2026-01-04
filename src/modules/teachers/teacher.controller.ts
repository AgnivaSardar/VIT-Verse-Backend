import { Request, Response } from "express";
import * as teacherService from "./teacher.service.js";
import { CreateTeacherRequest, UpdateTeacherRequest } from "./teacher.types.js";
import { toJSON } from "../../common/utils.js";
import { AppError } from "../../common/errors.js";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: (err: any) => void) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

export const createTeacher = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateTeacherRequest = req.body;
  await teacherService.createTeacher(input);
  res.status(201).json({ message: "Teacher created successfully" });
}
);

export const getTeacher = asyncHandler(async (req: Request, res: Response) => {
  const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
  const teacher = await teacherService.getTeacherByID(userID);
  res.json(toJSON(teacher));
});

export const deleteTeacher = asyncHandler(async (req: Request, res: Response) => {
  const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
  await teacherService.deleteTeacher(userID);
  res.json({ message: "Teacher deleted successfully" });
}
);

export const updateTeacher = asyncHandler(async (req: Request, res: Response) => {
  const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
  const input: UpdateTeacherRequest = req.body;
    await teacherService.updateTeacher(userID, input);
    res.json({ message: "Teacher updated successfully" });
});

export const listTeachers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await teacherService.listTeachers(page, limit);
  res.json(toJSON(result));
}
);

export const TeacherController = {
  createTeacher,
  getTeacher,
    deleteTeacher,
    updateTeacher,
    listTeachers,
};
