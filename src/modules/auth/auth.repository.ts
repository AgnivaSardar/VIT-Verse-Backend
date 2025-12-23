import { prisma } from "../../config/prisma";

export async function getUserByEmail(email: string) {
  return prisma.users.findUnique({
    where: { userEmail: email },
  });
}

export async function getUserByStudentRegID(studentRegID: string) {
  return prisma.users.findFirst({
    where: {
      student: {
        studentRegID,
      },
    },
  });
}

export async function getUserByEmployeeID(employeeID: string) {
  return prisma.users.findFirst({
    where: {
      teacher: {
        teacherID: employeeID,
      },
    },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  studentRegID?: string;
  employeeID?: string;
}) {
  const user = await prisma.users.create({
    data: {
      userName: data.name,
      userEmail: data.email,
      userPassword: data.password,
      role: data.role,
    },
  });

  if (data.role === 'student' && data.studentRegID) {
    await prisma.student.create({
      data: {
        studentRegID: data.studentRegID,
        userID: user.userID,
        studentBranch: '',
        studentYear: new Date().getFullYear(),
      },
    });
  } else if (data.role === 'teacher' && data.employeeID) {
    await prisma.teacher.create({
      data: {
        teacherID: data.employeeID,
        userID: user.userID,
        teacherSchool: '',
      },
    });
  }

  return user;
}

export async function getUserById(id: bigint) {
  return prisma.users.findUnique({
    where: { userID: id },
  });
}