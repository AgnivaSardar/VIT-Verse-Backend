import { Request,Response } from "express";
import * as studentService from "./student.service";
import { CreateStudentRequest, UpdateStudentRequest } from "./student.types";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    };
}

export const getStudent = asyncHandler(async (req: Request, res: Response) => {
    const userID = BigInt(req.params.userID);
    const student = await studentService.getStudentByID(userID);
    res.json(student);
});

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
    const input: CreateStudentRequest = req.body;
    await studentService.createStudent(input);
    res.status(201).json({ message: "Student created successfully" });
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
    const userID = BigInt(req.params.userID);
    const input: UpdateStudentRequest = req.body;
    await studentService.updateStudent(userID, input);
    res.json({ message: "Student updated successfully" });
});

export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
    const userID = BigInt(req.params.userID);
    await studentService.deleteStudent(userID);
    res.json({ message: "Student deleted successfully" });
});

export const StudentController = {
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
};