import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, ArrowLeft, RefreshCcw } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/axiosInstance";
import { toast } from "sonner";

export default function EmailVerify() {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email") || "";
  const username = query.get("username") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    try {
      await api.post("/auth/resend-otp", {
        email,
        purpose: "email_verification",
        username,
      });
      toast.success("OTP resent successfully!");
      setCooldown(30);
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

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
    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        otp: otp.join(""),
        purpose: "email_verification",
      });
      if (response.data.success) {
        toast.success("Email verified successfully! You can now log in.");
        navigate("/auth/login");
      } else {
        toast.error(`Verification failed: ${response.data.message}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Verification failed.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Back to signup */}
      <button
        onClick={() => navigate(`/auth?auth=${encodeURIComponent("signup")}`)}
        className="group absolute left-6 top-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to signup
      </button>

      {/* Background blur */}
      <div className="absolute left-10 top-20 h-20 w-20 animate-pulse rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-40 right-20 h-32 w-32 animate-pulse rounded-full bg-secondary/5 blur-3xl delay-1000" />

      {/* OTP Card */}
      <div className="z-10 w-full max-w-md animate-fade-in-up rounded-2xl border border-border bg-card p-8 shadow-card backdrop-blur-xl">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
            <Mail className="h-6 w-6 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Enter your OTP</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              We’ve sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify your email.
            </p>
          </div>

          <form onSubmit={handleVerify} className="w-full animate-fade-in-up space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  className="h-12 w-12 rounded-lg border border-border bg-background text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              ))}
            </div>
            <Button type="submit" size="lg" className="group w-full font-semibold">
              Verify Code
              <CheckCircle2 className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
            </Button>
          </form>

          {/* Resend OTP Section */}
          <div className="text-sm text-muted-foreground">
            Didn’t get the code?{" "}
            <button
              onClick={handleResendOtp}
              disabled={cooldown > 0}
              className={`inline-flex items-center gap-1 font-medium text-primary transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Badge className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/20">
            🔒 Secure verification powered by MailFlow
          </Badge>
        </div>
      </div>
    </div>
  );
}
