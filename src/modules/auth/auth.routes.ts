import { Router } from "express";
import { register, login, verifyOTP, resendOTP, requestPasswordChange, changePassword } from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/request-password-change", requestPasswordChange);
router.post("/change-password", changePassword);

export default router;
