import { Router } from "express";
import { register, login, verifyOTP, resendOTP, requestPasswordChange, changePassword } from "./auth.controller";
import { loginLimiter, registerLimiter, passwordResetLimiter } from "../../middlewares/rateLimiter.middleware";

const router = Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/verify-otp", loginLimiter, verifyOTP);
router.post("/resend-otp", loginLimiter, resendOTP);
router.post("/request-password-change", passwordResetLimiter, requestPasswordChange);
router.post("/change-password", passwordResetLimiter, changePassword);

export default router;
