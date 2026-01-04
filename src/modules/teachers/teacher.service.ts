import { AppError } from "../../common/errors.js";
import * as teacherRepo from "./teacher.repository.js";
import { CreateTeacherRequest, UpdateTeacherRequest } from "./teacher.types.js";

export async function createTeacher(data: CreateTeacherRequest): Promise<void> {
    // Validate unique teacherID
    const existingTeacher = await teacherRepo.getTeacherByTeacherID(data.teacherID);
    if (existingTeacher) {
        throw new AppError("Teacher ID already exists", 400);
    }
    await teacherRepo.createTeacher(data);
}

export async function getTeacherByID(userID: bigint) {
    const teacher = await teacherRepo.getTeacherByID(userID);
    if (!teacher) {
        throw new AppError("Teacher not found", 404);
    }
    return teacher;
}

export async function updateTeacher(userID: bigint, data: UpdateTeacherRequest): Promise<void> {
    const teacher = await teacherRepo.getTeacherByID(userID);
    if (!teacher) {
        throw new AppError("Teacher not found", 404);
    }
    await teacherRepo.updateTeacher(userID, data);
}

export async function deleteTeacher(userID: bigint): Promise<void> {
    const teacher = await teacherRepo.getTeacherByID(userID);
    if (!teacher) {
        throw new AppError("Teacher not found", 404);
    }
    await teacherRepo.deleteTeacher(userID);
}

export async function listTeachers(page: number, limit: number) {
    return teacherRepo.listTeachers(page, limit);
}

export function createTeacherService(input: CreateTeacherRequest) {
    throw new Error("Function not implemented.");
}
export function getTeacherService(userID: bigint) {
    throw new Error("Function not implemented.");
}
export function updateTeacherService(userID: bigint, input: UpdateTeacherRequest) {
    throw new Error("Function not implemented.");
}
export function deleteTeacherService(userID: bigint) {
    throw new Error("Function not implemented.");
}
export function listTeachersService(page: number, limit: number) {
    throw new Error("Function not implemented.");
}
