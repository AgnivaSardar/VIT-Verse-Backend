import { Request, Response } from "express";
import * as userService from "./user.service";
import { CreateUserRequest, UpdateUserRequest } from "./user.types";
import { toJSON } from "../../common/utils";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: (err: any) => void) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateUserRequest = req.body;
  await userService.createUser(input);
  res.status(201).json({ message: "User created successfully" });
}
);

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const userID = BigInt(req.params.userID);
  const user = await userService.getUserByID(userID);
  res.json(toJSON(user));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userID = BigInt(req.params.userID);
  const input: UpdateUserRequest = req.body;
  await userService.updateUser(userID, input);
  res.json({ message: "User updated successfully" });
}
);

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userID = BigInt(req.params.userID);
  await userService.deleteUser(userID);
  res.json({ message: "User deleted successfully" });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await userService.listUsers(page, limit);
  res.json(toJSON(result));
}
);

export const activateUser = asyncHandler(async (req: Request, res: Response) => {
  const userID = BigInt(req.params.userID);
  await userService.activateUser(userID);
  res.json({ message: "User activated successfully" });
});

export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const userID = BigInt(req.params.userID);
  await userService.deactivateUser(userID);
  res.json({ message: "User deactivated successfully" });
});

export const UserController = {
  createUser,
  getUser,
    updateUser,
    deleteUser,
    listUsers,
    activateUser,
    deactivateUser,
};