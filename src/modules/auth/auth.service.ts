import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { AppError, ValidationError } from '../../common/errors';
import { config } from '../../config/env';
import * as authRepo from './auth.repository';
import { LoginRequest, RegisterRequest } from './auth.types';

export async function registerUser(data: RegisterRequest): Promise<void> {
  const existingUser = await authRepo.getUserByEmail(data.email);
    if (existingUser) {
    throw new ValidationError('Email is already in use');
  }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await authRepo.createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });
}

export async function loginUser(data: LoginRequest): Promise<string> {
  const user = await authRepo.getUserByEmail(data.email);
    if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
    const isPasswordValid = await bcrypt.compare(data.password, user.userPassword);
    if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }
    const token = jwt.sign(
    { userID: user.userID.toString(), role: user.role },
    config.jwtSecret,
    { expiresIn: '1h' }
  );
    return token;
}

export function register(input: { name: string; email: string; password: string; }) {
    throw new Error('Function not implemented.');
}
export function login(input: { email: string; password: string; }) {
    throw new Error('Function not implemented.');
}

