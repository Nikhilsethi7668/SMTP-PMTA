import React, { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../axiosInstance";
export default function EmailVerify() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email") || "";
  const username = query.get("username") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    const nextInput = document.getElementById(`otp-${index + 1}`);
    if (value && nextInput) nextInput.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length !== 6) {
      alert("Please enter the full 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/verify-otp", {
        email,
        otp: otp.join(""),
        purpose: "email_verification",
      });

      if (response.data.success) {
        alert("✅ Email verified successfully! You can now log in.");
        navigate("/login");
      } else {
        alert(`❌ Verification failed: ${response?.data?.message}`);
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      alert(
        error?.response?.data?.message ||
          "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/auth?auth=${encodeURIComponent("signup")}`)}
        className="absolute left-6 top-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to signup
      </button>

      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-lg z-10">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 shadow-md">
            <Mail className="h-6 w-6 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Enter your OTP</h1>
            <p className="max-w-sm text-sm text-gray-400">
              We've sent a 6-digit code to <span className="font-medium">{email}</span>.
              Enter it below to verify your email.
            </p>
          </div>

          <form onSubmit={handleVerify} className="w-full space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  className="h-12 w-12 rounded-lg border border-gray-700 bg-gray-900 text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code →"}
            </button>
          </form>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-sm">
            🔒 Secure verification powered by MailFlow
          </div>
        </div>
      </div>
    </div>
  );
}
