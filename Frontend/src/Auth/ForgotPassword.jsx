import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPasswordPopup, setShowPasswordPopup] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  // ================= SEND OTP =================

  const sendOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        {
          email,
        }
      );

      console.log("Send OTP:", response.data);

      setStep(2);
      setMessage("OTP sent successfully");
    } catch (error) {
      console.log(
        "Send OTP Error:",
        error.response?.data
      );

      setMessage(
        error.response?.data?.message ||
          "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================

  const verifyOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        `${API_URL}/api/auth/verify-forgot-otp`,
        {
          email,
          otp,
        }
      );

      console.log("Verify OTP:", response.data);

      // OTP verified -> password popup
      setShowPasswordPopup(true);
    } catch (error) {
      console.log(
        "Verify OTP Error:",
        error.response?.data
      );

      setMessage(
        error.response?.data?.message ||
          "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= RESET PASSWORD =================

  const resetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        `${API_URL}/api/auth/reset-password`,
        {
          email,
          otp,
          newPassword: password,
        }
      );

      console.log(
        "Reset Password:",
        response.data
      );

      setShowPasswordPopup(false);

      navigate("/login");
    } catch (error) {
      console.log(
        "Reset Password Error:",
        error.response?.data
      );

      setMessage(
        error.response?.data?.message ||
          "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      {/* ================= MAIN CARD ================= */}

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

        <h2 className="text-2xl font-bold text-center mb-2">
          Forgot Password
        </h2>

        <p className="text-gray-500 text-center mb-6">
          {step === 1 &&
            "Enter your email to receive OTP"}

          {step === 2 &&
            "Enter the OTP sent to your email"}
        </p>

        {message && !showPasswordPopup && (
          <p className="text-center text-sm mb-4 text-blue-600">
            {message}
          </p>
        )}

        {/* ================= STEP 1 ================= */}

        {step === 1 && (
          <form onSubmit={sendOtp}>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="w-full border border-gray-300 p-3 rounded-lg mb-4 outline-none focus:border-black"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-3 rounded-lg cursor-pointer disabled:opacity-60"
            >
              {loading
                ? "Sending..."
                : "Send OTP"}
            </button>

          </form>
        )}

        {/* ================= STEP 2 ================= */}

        {step === 2 && (
          <form onSubmit={verifyOtp}>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(/\D/g, "")
                )
              }
              maxLength={6}
              required
              className="w-full border border-gray-300 p-3 rounded-lg mb-4 text-center tracking-[8px] outline-none focus:border-black"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-3 rounded-lg cursor-pointer disabled:opacity-60"
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setMessage("");
              }}
              className="w-full mt-3 text-sm text-gray-500 hover:text-black cursor-pointer"
            >
              Change Email
            </button>

          </form>
        )}

        {/* ================= BACK TO LOGIN ================= */}

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full mt-6 text-sm text-gray-500 hover:text-black cursor-pointer"
        >
          Back to Login
        </button>

      </div>

      {/* ================================================= */}
      {/*                 PASSWORD POPUP                    */}
      {/* ================================================= */}

      {showPasswordPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

          <div className="w-full max-w-md bg-white rounded-2xl p-7 shadow-2xl">

            <h2 className="text-2xl font-bold text-center mb-2">
              Create New Password
            </h2>

            <p className="text-gray-500 text-center text-sm mb-6">
              Enter your new password
            </p>

            {message && (
              <p className="text-center text-sm mb-4 text-red-500">
                {message}
              </p>
            )}

            <form onSubmit={resetPassword}>

              {/* NEW PASSWORD */}

              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                className="w-full border border-gray-300 p-3 rounded-lg mb-4 outline-none focus:border-black"
              />

              {/* CONFIRM PASSWORD */}

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
                className="w-full border border-gray-300 p-3 rounded-lg mb-5 outline-none focus:border-black"
              />

              {/* CHANGE PASSWORD */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white p-3 rounded-lg cursor-pointer disabled:opacity-60"
              >
                {loading
                  ? "Changing..."
                  : "Change Password"}
              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default ForgotPassword;