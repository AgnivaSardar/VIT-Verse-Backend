import { prisma } from "../../config/prisma.js";

export async function getStudentByID(id: bigint) {
  return prisma.student.findUnique({
    where: { userID: id },
  });
}

export async function createStudent(data: {
  userID: bigint;
  studentRegID: string;
    studentBranch: string;
    studentYear: number;
}) {
  return prisma.student.create({
    data: {
      userID: data.userID,
      studentRegID: data.studentRegID,
        studentBranch: data.studentBranch,
        studentYear: data.studentYear,
    },
  });
}

export async function updateStudent(id: bigint, data: {
    studentRegID?: string;
    studentBranch?: string;
    studentYear?: number;
}) {
  return prisma.student.update({
    where: { userID: id },
    data: data,
  });
}

export async function deleteStudent(id: bigint) {
  return prisma.student.delete({
    where: { userID: id },
  });
}

