import express from "express"
import { register, login, verifyOtp, forgotPassword, resetPassword} from "../Controllers/authController.js"

const authRouter = express.Router();

// reister k liye 
authRouter.post("/register", register);

//  login k liye 

authRouter.post("/login", login);

//  otp verify krne k liye

authRouter.post("/verify-otp", verifyOtp);

//  Forgot password

authRouter.post("/forgot-password", forgotPassword);

//  reset password 

authRouter.post("/reset-password", resetPassword);

export default authRouter;