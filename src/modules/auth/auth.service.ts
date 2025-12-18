// src/modules/auth/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { AppError, ValidationError } from '../../common/errors';
import { config } from '../../config/env';
import * as authRepo from './auth.repository';
import { LoginRequest, RegisterRequest } from './auth.types';

export interface AuthUser {
  id: string;   // matches JWT payload + index.d.ts UserPayload
  role: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// ✅ UPDATED: registerUser now RETURNS token + user
export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const existingUser = await authRepo.getUserByEmail(data.email);
  if (existingUser) {
    throw new ValidationError('Email is already in use');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await authRepo.createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  // ✅ JWT SIGNING: matches AuthUser interface
  const payload: AuthUser = {
    id: user.userID.toString(),  // bigint → string
    role: user.role,
  };

  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

  return {
    token,
    user: {
      id: user.userID.toString(),
      name: user.userName,
      email: user.userEmail,
      role: user.role,
    },
  };
}

// ✅ UPDATED: loginUser now RETURNS AuthResponse (token + user)
export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const user = await authRepo.getUserByEmail(data.email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.userPassword);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // ✅ JWT SIGNING: matches AuthUser interface
  const payload: AuthUser = {
    id: user.userID.toString(),  // bigint → string
    role: user.role,
  };

  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

  return {
    token,
    user: {
      id: user.userID.toString(),
      name: user.userName,
      email: user.userEmail,
      role: user.role,
    },
  };
}

// ✅ Remove the unimplemented functions or implement them
// These were throwing "not implemented" errors
export async function register(input: { name: string; email: string; password: string; role: string }) {
  return registerUser({ name: input.name, email: input.email, password: input.password, role: input.role });
}

export async function login(input: { email: string; password: string }) {
  return loginUser({ email: input.email, password: input.password });
}
