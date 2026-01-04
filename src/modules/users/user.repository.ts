import { prisma } from "../../config/prisma.js";

// Safe user fields to return in API responses (excludes password)
const SAFE_USER_SELECT = {
  userID: true,
  userName: true,
  userEmail: true,
  userPhone: true,
  role: true,
  isActive: true,
  isEmailVerified: true,
  isSuperAdmin: true,
  createdAt: true,
};

export async function getUserByID(id: bigint) {
  return prisma.users.findUnique({
    where: { userID: id },
    select: SAFE_USER_SELECT,
  });
}
export async function getUserByEmail(email: string) {
  // Internal use - return all fields for password verification
  return prisma.users.findUnique({
    where: { userEmail: email },
  });
}
export async function getUserByEmailSafe(email: string) {
  // Public use - return only safe fields
  return prisma.users.findUnique({
    where: { userEmail: email },
    select: SAFE_USER_SELECT,
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
  // Convert userPhone to number if present and map username to userName
  const updateData: any = {};
  if (data.username !== undefined) updateData.userName = data.username;
  if (data.userEmail !== undefined) updateData.userEmail = data.userEmail;
  if (data.userPassword !== undefined) updateData.userPassword = data.userPassword;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.userPhone !== undefined) updateData.userPhone = Number(data.userPhone);
  
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
    select: SAFE_USER_SELECT,
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

export const userRepository = {
  getUserByID,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  listUsers,
  deactivateUser,
  activateUser,
};
