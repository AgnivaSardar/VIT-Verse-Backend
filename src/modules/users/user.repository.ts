import { prisma } from "../../config/prisma";

export async function getUserByID(id: bigint) {
  return prisma.users.findUnique({
    where: { userID: id },
  });
}
export async function getUserByEmail(email: string) {
  return prisma.users.findUnique({
    where: { userEmail: email },
  });
}
export async function createUser(data: {
  username: string;
  userEmail: string;
    userPassword: string;
    userPhone?: string;
    role: 'admin' | 'student' | 'teacher';
}) {
    return prisma.users.create({
    data: {
      userName: data.username,
      userEmail: data.userEmail,
        userPassword: data.userPassword,
        userPhone: data.userPhone ? Number(data.userPhone) : undefined,
        role: data.role,
        isActive: true,
    },
  });
}

export async function updateUser(id: bigint, data: {
    username?: string;
    userEmail?: string;
    userPassword?: string;
    userPhone?: string;
    role?: 'admin' | 'student' | 'teacher';
    isActive?: boolean;
}) {
  // Convert userPhone to number if present
  const updateData = {
    ...data,
    userPhone: data.userPhone !== undefined ? Number(data.userPhone) : undefined,
  };
  return prisma.users.update({
    where: { userID: id },
    data: updateData,
  });
}

export async function deleteUser(id: bigint) {
  return prisma.users.delete({
    where: { userID: id },
  });
}

export async function listUsers(page: number, limit: number) {
  const users = await prisma.users.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });
  const totalUsers = await prisma.users.count();
  return { users, totalUsers };
}
export async function deactivateUser(id: bigint) {
  return prisma.users.update({
    where: { userID: id },
    data: { isActive: false },
  });
}
export async function activateUser(id: bigint) {
  return prisma.users.update({
    where: { userID: id },
    data: { isActive: true },
  });
}
