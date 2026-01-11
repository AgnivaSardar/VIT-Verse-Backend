import { Request, Response } from "express";
import * as userService from "./user.service.js";
import { CreateUserRequest, UpdateUserRequest } from "./user.types.js";
import { toJSON } from "../../common/utils.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { AppError } from "../../common/errors.js";
import { sanitizeUserForNonAdmin, sanitizeUser } from "../../common/sanitize.js";

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

export const getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
  const user = await userService.getUserByID(userID);
  
  // Check if the requester is a super admin
  const isSuperAdmin = req.user?.isSuperAdmin === true;
  
  // Check if the requester is viewing their own profile
  const isOwnProfile = req.user?.id !== undefined && BigInt(req.user.id) === userID;
  
  // Users viewing their own profile get full data (sanitized to remove passwords/tokens)
  if (isOwnProfile || isSuperAdmin) {
    res.json(toJSON(sanitizeUser(user)));
    return;
  }
  
  // Other users only get minimal user data (userName and userID)
  const minimalData = sanitizeUserForNonAdmin(user);
  res.json(toJSON(minimalData));
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
  // Users can only update their own profile
  if (req.user!.id !== req.params.userID && req.user!.role !== 'admin') {
    res.status(403).json({ error: "Forbidden: You can only update your own profile" });
    return;
  }
  const input: UpdateUserRequest = req.body;
  await userService.updateUser(userID, input);
  res.json({ message: "User updated successfully" });
}
);

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Only admins can delete users
  if (req.user!.role !== 'admin') {
    res.status(403).json({ error: "Forbidden: Only admins can delete users" });
    return;
  }
  const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
  await userService.deleteUser(userID);
  res.json({ message: "User deleted successfully" });
});

export const listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Only admins can list all users
  if (req.user!.role !== 'admin') {
    res.status(403).json({ error: "Forbidden: Only admins can list users" });
    return;
  }
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await userService.listUsers(page, limit);
  res.json(toJSON(result));
}
);

export const activateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Only admins can activate/deactivate users
  if (req.user!.role !== 'admin') {
    res.status(403).json({ error: "Forbidden: Only admins can manage user activation" });
    return;
  }
  const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
  await userService.activateUser(userID);
  res.json({ message: "User activated successfully" });
});

export const deactivateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Only admins can activate/deactivate users
  if (req.user!.role !== 'admin') {
    res.status(403).json({ error: "Forbidden: Only admins can manage user activation" });
    return;
  }
  const userID = (() => {
  const { userID } = req.params;
  if (!userID) {
    throw new AppError("userID is required", 400);
  }
  return BigInt(userID);
})()
;
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
