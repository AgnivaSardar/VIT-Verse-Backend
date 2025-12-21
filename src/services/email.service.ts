// Email service with SendGrid
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@vitvverse.com';
const FROM_NAME = process.env.FROM_NAME || 'VIT-Verse';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('⚠️  SendGrid API key not configured. Email sending will fail.');
}

// OTP Store (in-memory, use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

export const emailService = {
  /**
   * Generate 6-digit OTP
   */
  generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  },

  /**
   * Store OTP with expiry (5 minutes)
   */
  storeOTP(email: string, otp: string): void {
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    });
  },

  /**
   * Verify OTP
   */
  verifyOTP(email: string, otp: string): { valid: boolean; message: string } {
    const stored = otpStore.get(email);
    
    if (!stored) {
      return { valid: false, message: 'OTP not found or expired' };
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return { valid: false, message: 'OTP expired' };
    }

    if (stored.attempts >= 3) {
      otpStore.delete(email);
      return { valid: false, message: 'Too many failed attempts' };
    }

    if (stored.otp !== otp) {
      stored.attempts++;
      return { valid: false, message: 'Invalid OTP' };
    }

    otpStore.delete(email);
    return { valid: true, message: 'OTP verified successfully' };
  },

  /**
   * Send OTP email
   */
  async sendOTP(email: string, name: string): Promise<void> {
    const otp = this.generateOTP();
    this.storeOTP(email, otp);

    const msg = {
      to: email,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: 'VIT-Verse Email Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4f8bff, #17c3ff); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp { font-size: 32px; font-weight: bold; color: #4f8bff; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { color: #e74c3c; font-size: 14px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VIT-Verse</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>Thank you for registering with VIT-Verse! Please use the following OTP to verify your email address:</p>
              <div class="otp">${otp}</div>
              <p>This OTP is valid for <strong>5 minutes</strong>.</p>
              <p class="warning">⚠️ Never share this OTP with anyone. VIT-Verse will never ask for your OTP via phone or email.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 VIT-Verse. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ OTP sent to ${email}`);
    } catch (error: any) {
      console.error('❌ SendGrid error:', error.response?.body || error);
      throw new Error('Failed to send OTP email');
    }
  },

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const msg = {
      to: email,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: 'Welcome to VIT-Verse!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4f8bff, #17c3ff); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #4f8bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to VIT-Verse! 🎉</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>Your account has been successfully verified! You're now part of the VIT-Verse community.</p>
              <p>Get started by:</p>
              <ul>
                <li>Creating your channel</li>
                <li>Uploading your first video</li>
                <li>Exploring content from other creators</li>
              </ul>
              <div style="text-align: center;">
                <a href="${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}" class="button">Visit VIT-Verse</a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2025 VIT-Verse. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ SendGrid error:', error.response?.body || error);
      // Don't throw - welcome email is not critical
    }
  },

  /**
   * Send admin notification
   */
  async sendAdminNotification(subject: string, message: string): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || '';
    if (!adminEmail) return;

    const msg = {
      to: adminEmail,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `[VIT-Verse Admin] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${subject}</h2>
          <p>${message}</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This is an automated notification from VIT-Verse.
          </p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('❌ Failed to send admin notification:', error);
    }
  },
};

export function isEmailServiceConfigured(): boolean {
  return !!SENDGRID_API_KEY;
}

export function verifyOTP(email: string, otp: string): boolean {
  const result = emailService.verifyOTP(email, otp);
  return result.valid;
}

export async function sendOTP(email: string, name: string): Promise<void> {
  await emailService.sendOTP(email, name);
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  await emailService.sendWelcomeEmail(email, name);
}

