import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER;

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/api/auth/register`,
        form
      );

      setShowOtp(true);
      setOtpError("");

      console.log(res.data);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      setOtpError("");
      setOtpLoading(true);

      const res = await axios.post(
        `${API_URL}/api/auth/verify-otp`,
        {
          email: form.email,
          otp,
        }
      );

      const { token, user } = res.data;

      // Save login data
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // User home page
      navigate("/");

    } catch (error) {
      setOtpError(
        error.response?.data?.message ||
          "Invalid OTP"
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // RESEND OTP
  const handleResendOtp = async () => {
    try {
      setOtpError("");

      await axios.post(
        `${API_URL}/api/auth/resend-otp`,
        {
          email: form.email,
        }
      );

      setOtpError("OTP sent again successfully");

    } catch (error) {
      setOtpError(
        error.response?.data?.message ||
          "Failed to resend OTP"
      );
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm sm:p-8">

        <h1 className="text-center text-3xl font-bold">
          Create Account
        </h1>

        <p className="mt-2 text-center text-sm text-gray-500">
          Join Shopora today
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
        >

          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            type="text"
            placeholder="Full name"
            required
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="Email address"
            required
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
          />

          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            required
            minLength={6}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
          />

          <input
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            type="password"
            placeholder="Confirm password"
            required
            minLength={6}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
          />

          <button
            disabled={loading}
            className="w-full rounded-xl bg-green-500 py-3 font-semibold text-white hover:bg-green-600 disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Account"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-500">

          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-green-600"
          >
            Login
          </Link>

        </p>

      </div>

      {/* OTP POPUP */}
      {showOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">

            <button
              onClick={() => setShowOtp(false)}
              className="absolute right-5 top-4 text-xl text-gray-400 hover:text-black"
            >
              ×
            </button>

            <h2 className="text-center text-2xl font-bold">
              Verify Your Email
            </h2>

            <p className="mt-2 text-center text-sm text-gray-500">
              OTP sent to
            </p>

            <p className="mt-1 text-center text-sm font-semibold text-gray-800">
              {form.email}
            </p>

            {otpError && (
              <div
                className={`mt-5 rounded-lg px-4 py-3 text-sm ${
                  otpError.includes("successfully")
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {otpError}
              </div>
            )}

            <form
              onSubmit={handleVerifyOtp}
              className="mt-6"
            >

              <input
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6 digit OTP"
                required
                className="w-full rounded-xl border px-4 py-4 text-center text-xl tracking-[8px] outline-none focus:border-green-500"
              />

              <button
                disabled={
                  otpLoading || otp.length !== 6
                }
                className="mt-4 w-full rounded-xl bg-green-500 py-3 font-semibold text-white hover:bg-green-600 disabled:opacity-50"
              >
                {otpLoading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>

            </form>

            <div className="mt-5 text-center">

              <span className="text-sm text-gray-500">
                Didn't receive OTP?{" "}
              </span>

              <button
                onClick={handleResendOtp}
                className="text-sm font-semibold text-green-600 hover:underline"
              >
                Resend OTP
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Register;