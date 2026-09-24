import express from "express";

import {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  verifyForgotOtp,
  resetPassword,
} from "../Controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/resend-otp", resendOtp);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-forgot-otp", verifyForgotOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;