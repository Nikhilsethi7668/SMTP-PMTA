import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/axiosInstance";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email || !password) throw new Error("Please fill in all fields");
      setIsLoading(true);

      const response = await api.post("/auth/login", { email, password });
      if (response.status === 200) {
        const data = response.data.user;
        useUserStore.getState().setUser({
          user_id: data._id,
          full_name: data.full_name,
          username: data.username,
          role: data.role,
          email: data.email,
          daily_quota: data.daily_quota,
          monthly_quota: data.monthly_quota,
          used_today: data.used_today,
          used_month: data.used_month,
          rate_limit: data.rate_limit,
        });
        navigate("/app/dashboard/accounts");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-card">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Welcome back 👋</h1>
          <p className="text-muted-foreground">
            Log in to manage your email campaigns and API keys.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="cursor-pointer text-muted-foreground">
                Remember me
              </label>
            </div>
            <a href="#" className="font-medium text-primary hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="w-full font-semibold">
            {isLoading ? <Spinner /> : "Log In"}
          </Button>
        </form>

        <div className="pt-6 text-center text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/auth/signup")}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
