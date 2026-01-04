// src/modules/auth/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../../config/prisma.js';
import { AppError, ValidationError } from '../../common/errors.js';
import { config } from '../../config/env.js';
import * as authRepo from './auth.repository.js';
import { LoginRequest, RegisterRequest } from './auth.types.js';
import { sendOTP, verifyOTP, sendWelcomeEmail } from '../../services/email.service.js';

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
    isSuperAdmin: boolean;
  };
}

// ✅ UPDATED: registerUser now sends OTP and does NOT return token until verified
export async function registerUser(data: RegisterRequest): Promise<{ message: string; userId: string }> {
  // Email uniqueness
  const existingUser = await authRepo.getUserByEmail(data.email);
  if (existingUser) {
    throw new ValidationError('Email is already in use');
  }

  // Role-specific ID uniqueness
  if (data.role === 'student' && data.studentRegID) {
    const existingStudent = await authRepo.getUserByStudentRegID(data.studentRegID);
    if (existingStudent) {
      throw new ValidationError('This Student Registration Number is already registered');
    }
  } else if (data.role === 'teacher' && data.employeeID) {
    const existingTeacher = await authRepo.getUserByEmployeeID(data.employeeID);
    if (existingTeacher) {
      throw new ValidationError('This Employee ID is already registered');
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await authRepo.createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role,
    studentRegID: data.studentRegID,
    employeeID: data.employeeID,
  });

  // Send OTP for email verification
  try {
    await sendOTP(user.userEmail, user.userName);
    console.log(`✅ OTP email queued for: ${user.userEmail}`);
  } catch (error: any) {
    console.error('❌ SendGrid error:', error.message);
    // In development, auto-verify email to allow testing
    // In production, fail registration if email cannot be sent
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('Failed to send verification email. Please try again later.', 500);
    } else {
      console.warn('⚠️  Dev mode: Auto-verifying email due to SendGrid error');
      await prisma.users.update({
        where: { userEmail: user.userEmail },
        data: { isEmailVerified: true },
      });
    }
  }

  return {
    message: process.env.NODE_ENV === 'production' 
      ? 'Registration successful. Please check your email for OTP verification.'
      : 'Registration successful. Email auto-verified in dev mode.',
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
      isSuperAdmin: user.isSuperAdmin,
    },
  };
}

// ✅ UPDATED: loginUser now checks email verification
export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  console.log('🔐 Login attempt:', data.identifier);
  
  let user = null;

  if (data.identifier.includes('@')) {
    user = await authRepo.getUserByEmail(data.identifier);
  } else if (/^\d{2}[A-Z]{3}\d{4}/.test(data.identifier) || data.identifier.toUpperCase().startsWith('VIT')) {
    user = await authRepo.getUserByStudentRegID(data.identifier);
  } else {
    user = await authRepo.getUserByEmployeeID(data.identifier);
  }

  if (!user) {
    console.log('❌ User not found:', data.identifier);
    throw new AppError('Invalid credentials', 401);
  }

  console.log('✅ User found:', { id: user.userID, role: user.role });

  const isPasswordValid = await bcrypt.compare(data.password, user.userPassword);
  if (!isPasswordValid) {
    console.log('❌ Invalid password for:', data.identifier);
    throw new AppError('Invalid credentials', 401);
  }

  console.log('✅ Password valid');

  // Email verification is required for all users except super admins
  if (!user.isEmailVerified && !user.isSuperAdmin) {
    console.log('❌ Email not verified for:', data.identifier);
    throw new AppError('Email not verified. Please verify your email to login.', 403);
  }

  const payload: AuthUser = {
    id: user.userID.toString(),
    role: user.role,
  };

  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as SignOptions);

  console.log('✅ Login successful');

  return {
    token,
    user: {
      id: user.userID.toString(),
      name: user.userName,
      email: user.userEmail,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isSuperAdmin: user.isSuperAdmin,
    },
  };
}

// ✅ Remove the unimplemented functions or implement them
// These were throwing "not implemented" errors
export async function register(input: RegisterRequest) {
  return registerUser(input);
}

export async function login(input: LoginRequest) {
  return loginUser(input);
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
