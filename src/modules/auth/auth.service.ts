// src/modules/auth/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { AppError, ValidationError } from '../../common/errors';
import { config } from '../../config/env';
import * as authRepo from './auth.repository';
import { LoginRequest, RegisterRequest } from './auth.types';
import { sendOTP, verifyOTP, sendWelcomeEmail } from '../../services/email.service';

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
    isEmailVerified: boolean;
  };
}

// ✅ UPDATED: registerUser now sends OTP and does NOT return token until verified
export async function registerUser(data: RegisterRequest): Promise<{ message: string; userId: string }> {
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

  // Send OTP for email verification
  await sendOTP(user.userEmail, user.userName);

  return {
    message: 'Registration successful. Please check your email for OTP verification.',
    userId: user.userID.toString(),
  };
}

// ✅ NEW: Verify OTP and mark email as verified
export async function verifyEmailOTP(email: string, otp: string): Promise<AuthResponse> {
  // Verify OTP
  const isValid = verifyOTP(email, otp);
  if (!isValid) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  // Update user email verification status
  const user = await prisma.users.update({
    where: { userEmail: email },
    data: { isEmailVerified: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Send welcome email
  await sendWelcomeEmail(user.userEmail, user.userName);

  // Generate JWT token
  const payload: AuthUser = {
    id: user.userID.toString(),
    role: user.role,
  };

  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as SignOptions);

  return {
    token,
    user: {
      id: user.userID.toString(),
      name: user.userName,
      email: user.userEmail,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  };
}

// ✅ UPDATED: loginUser now checks email verification
export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  console.log('🔐 Login attempt for email:', data.email);
  
  const user = await authRepo.getUserByEmail(data.email);
  if (!user) {
    console.log('❌ User not found:', data.email);
    throw new AppError('Invalid email or password', 401);
  }

  console.log('✅ User found:', { id: user.userID, email: user.userEmail, isEmailVerified: user.isEmailVerified, isSuperAdmin: user.isSuperAdmin });

  const isPasswordValid = await bcrypt.compare(data.password, user.userPassword);
  if (!isPasswordValid) {
    console.log('❌ Invalid password for:', data.email);
    throw new AppError('Invalid email or password', 401);
  }

  console.log('✅ Password valid');

  // Check if email is verified (skip check for super admins)
  // TEMPORARY: Disabled for development since SendGrid is not configured
  // if (!user.isEmailVerified && !user.isSuperAdmin) {
  //   console.log('❌ Email not verified for:', data.email);
  //   throw new AppError('Email not verified. Please verify your email to login.', 403);
  // }

  if (!user.isEmailVerified && !user.isSuperAdmin && process.env.NODE_ENV === 'production') {
    console.log('❌ Email not verified for:', data.email);
    throw new AppError('Email not verified. Please verify your email to login.', 403);
  }

  console.log('✅ Email verification check passed (development mode)');

  // ✅ JWT SIGNING: matches AuthUser interface
  const payload: AuthUser = {
    id: user.userID.toString(),  // bigint → string
    role: user.role,
  };

  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as SignOptions);

  console.log('✅ Login successful for:', data.email);

  return {
    token,
    user: {
      id: user.userID.toString(),
      name: user.userName,
      email: user.userEmail,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
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

// ✅ NEW: Change password with new hashed password
export async function changePassword(email: string, newPassword: string) {
  // Check if user exists
  const user = await prisma.users.findUnique({
    where: { userEmail: email },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.users.update({
    where: { userEmail: email },
    data: { userPassword: hashedPassword },
  });

  return { message: 'Password changed successfully' };
}
