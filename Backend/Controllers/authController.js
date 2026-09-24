import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Model/User.js";
import sendOtp from "../utils/sentOtp.js";

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ================= REGISTER =================

export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
    } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const loginEmail = email.toLowerCase();

    const existingUser = await User.findOne({
      email: loginEmail,
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }

      const otp = generateOtp();

      const otpExpire = new Date(
        Date.now() + 10 * 60 * 1000
      );

      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      existingUser.fullName = fullName;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpire = otpExpire;

      await existingUser.save();

      const sent = await sendOtp(
        existingUser.email,
        otp
      );

      if (!sent) {
        return res.status(500).json({
          success: false,
          message: "Failed to send OTP",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Account already exists but is not verified. New OTP sent.",
        userId: existingUser._id,
        email: existingUser.email,
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const otp = generateOtp();

    const otpExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const user = await User.create({
      fullName,
      email: loginEmail,
      password: hashedPassword,
      isVerified: false,
      role: "user",
      otp,
      otpExpire,
    });

    const sent = await sendOtp(user.email, otp);

    if (!sent) {
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please verify OTP",
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// ================= VERIFY REGISTER OTP =================

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified",
      });
    }

    if (!user.otp || !user.otpExpire) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request another OTP",
      });
    }

    if (user.otpExpire < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= RESEND REGISTER OTP =================

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    const otp = generateOtp();

    user.otp = otp;
    user.otpExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    const sent = await sendOtp(user.email, otp);

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= LOGIN =================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const loginEmail = email.toLowerCase();

    // ADMIN LOGIN
    if (
      process.env.ADMIN_EMAIL &&
      loginEmail ===
        process.env.ADMIN_EMAIL.toLowerCase() &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = generateToken({
        _id: "admin",
        role: "admin",
        email: loginEmail,
      });

      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
        user: {
          id: "admin",
          fullName: "Admin",
          email: loginEmail,
          role: "admin",
        },
      });
    }

    // USER LOGIN
    const user = await User.findOne({
      email: loginEmail,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= FORGOT PASSWORD =================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOtp();

    user.otp = otp;
    user.otpExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    const sent = await sendOtp(
      user.email,
      otp
    );

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= VERIFY FORGOT PASSWORD OTP =================

export const verifyForgotOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || !user.otpExpire) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request another OTP",
      });
    }

    if (user.otpExpire < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(
      "Verify forgot OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= RESET PASSWORD =================

export const resetPassword = async (req, res) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || !user.otpExpire) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request another OTP",
      });
    }

    if (user.otpExpire < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    user.otp = null;
    user.otpExpire = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};