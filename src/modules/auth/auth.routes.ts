import { Router } from "express";
import { register, login, logout, verifyOTP, resendOTP, requestPasswordChange, changePassword } from "./auth.controller.js";
import { loginLimiter, registerLimiter, passwordResetLimiter } from "../../middlewares/rateLimiter.middleware.js";
import cors from "cors";

const router = Router();

router.options('/login', cors());

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.post("/verify-otp", loginLimiter, verifyOTP);
router.post("/resend-otp", loginLimiter, resendOTP);
router.post("/request-password-change", passwordResetLimiter, requestPasswordChange);
router.post("/change-password", passwordResetLimiter, changePassword);

export default router;
