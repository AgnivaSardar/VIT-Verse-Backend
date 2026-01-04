import { AppError } from "../../common/errors.js";
import * as studentRepo from "./student.repository.js";
import { CreateStudentRequest, UpdateStudentRequest } from "./student.types.js";

export async function getStudentByID(userID: bigint) {
    const student = await studentRepo.getStudentByID(userID);
    if (!student) {
        throw new AppError('Student not found', 404);
    }
    return student;
}

export async function createStudent(data: CreateStudentRequest): Promise<void> {
    await studentRepo.createStudent(data);
}

export async function updateStudent(userID: bigint, data: UpdateStudentRequest): Promise<void> {
    const student = await studentRepo.getStudentByID(userID);
    if (!student) {
        throw new AppError('Student not found', 404);
    }
    await studentRepo.updateStudent(userID, data);
}

export async function deleteStudent(userID: bigint): Promise<void> {
    const student = await studentRepo.getStudentByID(userID);
    if (!student) {
        throw new AppError('Student not found', 404);
    }
    await studentRepo.deleteStudent(userID);
}
