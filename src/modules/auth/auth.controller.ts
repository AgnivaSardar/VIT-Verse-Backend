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
  // Ensure 'role' is provided, or set a default value if needed
  const result = await authService.register({ ...input, role: input.role ?? 'user' });
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

