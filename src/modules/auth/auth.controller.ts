import { Request, Response } from 'express';
import * as authService from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';
import { sendOTP } from '../../services/email.service';
import { z } from 'zod';

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json(result);
});

// ✅ NEW: Verify OTP endpoint
const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const input = verifyOTPSchema.parse(req.body);
  const result = await authService.verifyEmailOTP(input.email, input.otp);
  res.json(result);
});

// ✅ NEW: Resend OTP endpoint
const resendOTPSchema = z.object({
  email: z.string().email(),
});

export const resendOTP = asyncHandler(async (req: Request, res: Response) => {
  const input = resendOTPSchema.parse(req.body);
  
  // Get user by email to verify they exist
  const { prisma } = await import('../../config/prisma');
  const user = await prisma.users.findUnique({
    where: { userEmail: input.email },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (user.isEmailVerified) {
    res.status(400).json({ message: 'Email already verified' });
    return;
  }

  // Send new OTP
  await sendOTP(user.userEmail, user.userName);
  
  res.json({ message: 'OTP sent successfully' });
});

// ✅ NEW: Request password change OTP
const requestPasswordChangeSchema = z.object({
  email: z.string().email(),
});

export const requestPasswordChange = asyncHandler(async (req: Request, res: Response) => {
  const input = requestPasswordChangeSchema.parse(req.body);
  
  const { prisma } = await import('../../config/prisma');
  const user = await prisma.users.findUnique({
    where: { userEmail: input.email },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Send password change OTP
  const { emailService } = await import('../../services/email.service');
  await emailService.sendPasswordChangeOTP(user.userEmail, user.userName);
  
  res.json({ message: 'Password change OTP sent to your email' });
});

// ✅ NEW: Change password with OTP
const changePasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const input = changePasswordSchema.parse(req.body);
  
  // Verify OTP
  const { emailService } = await import('../../services/email.service');
  const otpResult = emailService.verifyOTP(input.email, input.otp);
  
  if (!otpResult.valid) {
    res.status(400).json({ message: otpResult.message });
    return;
  }

  // Update password
  const result = await authService.changePassword(input.email, input.newPassword);
  res.json(result);
});

