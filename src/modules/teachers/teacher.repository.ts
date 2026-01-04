import { prisma } from "../../config/prisma.js";

export async function getTeacherByID(id: bigint) {
  return prisma.teacher.findUnique({
    where: { userID: id },
  });
}

export async function createTeacher(data: {
  userID: bigint;
  teacherID: string;
    teacherSchool: string;
}) {
  return prisma.teacher.create({
    data: {
      userID: data.userID,
      teacherID: data.teacherID,
      teacherSchool: data.teacherSchool,
    },
  });
}

export async function updateTeacher(id: bigint, data: {
    teacherID?: string;
    teacherSchool?: string;
}) {
  return prisma.teacher.update({
    where: { userID: id },
    data: data,
  });
}

export async function deleteTeacher(id: bigint) {
  return prisma.teacher.delete({
    where: { userID: id },
  });
}

export async function getTeacherByTeacherID(teacherID: string) {
    return prisma.teacher.findUnique({
        where: { teacherID: teacherID },
    });
}

export async function listTeachers(page: number, limit: number) {
    const offset = (page - 1) * limit;
    return prisma.teacher.findMany({
        skip: offset,
        take: limit,
    });
}
