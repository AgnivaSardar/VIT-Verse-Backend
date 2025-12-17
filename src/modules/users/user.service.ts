import { AppError } from "../../common/errors";
import * as userRepo from "./user.repository";
import { CreateUserRequest, UpdateUserRequest } from "./user.types";

export async function createUser(data: CreateUserRequest): Promise<void> {
  // Check for existing user with the same email
  const existingUser = await userRepo.getUserByEmail(data.userEmail);
  if (existingUser) {
    throw new AppError("User with this email already exists", 400);
  }
  await userRepo.createUser(data);
}

export async function getUserByID(userID: bigint) {
  const user = await userRepo.getUserByID(userID);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
}

export async function updateUser(userID: bigint, data: UpdateUserRequest): Promise<void> {
  const user = await userRepo.getUserByID(userID);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    await userRepo.updateUser(userID, data);
}

export async function deleteUser(userID: bigint): Promise<void> {
  const user = await userRepo.getUserByID(userID);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    await userRepo.deleteUser(userID);
}

export async function listUsers(page: number, limit: number) {
  const users = await userRepo.listUsers(page, limit);
    return users;
}

export async function activateUser(userID: bigint): Promise<void> {
  const user = await userRepo.getUserByID(userID);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    await userRepo.updateUser(userID, { isActive: true });
}

export async function deactivateUser(userID: bigint): Promise<void> {
  const user = await userRepo.getUserByID(userID);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    await userRepo.updateUser(userID, { isActive: false });
}

