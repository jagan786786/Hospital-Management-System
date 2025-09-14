import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, User, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:4000/api";

const LoginForm = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  const { login } = useAuth();

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const validateForm = () => {
    const newErrors: { identifier?: string; password?: string } = {};

    if (!identifier) {
      newErrors.identifier = "Email or phone number is required";
    } else {
      // Check if it's either a valid email OR phone number
      const emailRegex = /\S+@\S+\.\S+/;
      const phoneRegex = /^\d{7,15}$/; // 7–15 digit phone
      if (!emailRegex.test(identifier) && !phoneRegex.test(identifier)) {
        newErrors.identifier = "Enter a valid email or phone number";
      }
    }

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be 6+ chars";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        identifier,
        password,
      });

      const { accessToken, refreshToken, role, name, type } = response.data;

      login(accessToken, refreshToken, { id: "", name, role, type });

      toast({
        title: "Login successful!",
        description: `Welcome back, ${name}!`,
      });

      if (type === "patient") window.location.href = "/patient-onboarding";
      else window.location.href = "/employee-onboarding";
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleRefreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return;

      const response = await axios.post(`${API_URL}/auth/refresh`, {
        token: refreshToken,
      });

      localStorage.setItem("accessToken", response.data.accessToken);
    } catch (err) {
      console.error("Refresh token failed", err);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    await handleLogin();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary floating orbs */}
        <div
          className="absolute top-20 left-20 w-32 h-32 rounded-full animate-pulse transform hover:scale-110 transition-transform duration-500"
          style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
        ></div>
        <div
          className="absolute top-40 right-32 w-24 h-24 rounded-full animate-bounce transform hover:scale-110 transition-transform duration-500"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            animationDelay: "1s",
          }}
        ></div>
        <div
          className="absolute bottom-32 left-40 w-40 h-40 rounded-full animate-pulse transform hover:scale-110 transition-transform duration-500"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            animationDelay: "2s",
          }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-28 h-28 rounded-full animate-bounce transform hover:scale-110 transition-transform duration-500"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            animationDelay: "0.5s",
          }}
        ></div>

        {/* Additional smaller orbs */}
        <div
          className="absolute top-60 left-10 w-16 h-16 rounded-full animate-ping"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            animationDelay: "3s",
          }}
        ></div>
        <div
          className="absolute top-10 right-60 w-12 h-12 rounded-full animate-ping"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            animationDelay: "1.5s",
          }}
        ></div>
        <div
          className="absolute bottom-60 right-10 w-20 h-20 rounded-full animate-ping"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            animationDelay: "2.5s",
          }}
        ></div>

        {/* Interactive mouse follower */}
        <div
          className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background: `radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)`,
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Header */}
        <div className="text-center mb-8 transform hover:scale-105 transition-transform duration-300">
          <div className="relative inline-block mb-6">
            <div
              className="absolute inset-0 w-24 h-24 rounded-full animate-spin-slow opacity-20"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
            ></div>
            <div
              className="relative flex items-center justify-center w-20 h-20 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
            >
              <User className="w-10 h-10 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-white animate-pulse" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-3 animate-fade-in">
            Welcome Back!
          </h1>
          <p className="text-gray-600 text-lg font-medium opacity-80">
            Please sign in to your account
          </p>
        </div>

        {/* Card */}
        <Card className="relative backdrop-blur-sm bg-white/90 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] overflow-hidden">
          {/* Card overlay */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
          ></div>

          <CardHeader className="relative space-y-4 text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-800">
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-600 text-base font-medium">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Identifier Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="identifier"
                  className="text-sm font-semibold text-gray-700"
                >
                  Email or Phone
                </Label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 group-hover:scale-110 group-focus-within:scale-110"
                    style={{ color: "rgba(59, 130, 246, 0.7)" }}
                  />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter your email or phone number"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errors.identifier)
                        setErrors((prev) => ({
                          ...prev,
                          identifier: undefined,
                        }));
                    }}
                    className={`pl-12 h-14 rounded-xl border-2 bg-white/70 backdrop-blur-sm font-medium text-gray-700 placeholder:text-gray-400 transition-all duration-300 hover:shadow-md focus:shadow-lg ${
                      errors.identifier
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={
                      !errors.identifier
                        ? ({
                            "--tw-ring-color": "rgba(59, 130, 246, 0.2)",
                          } as React.CSSProperties)
                        : {}
                    }
                    disabled={isLoading}
                  />
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                    style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
                  ></div>
                </div>
                {errors.identifier && (
                  <p className="text-sm text-red-500 font-medium animate-shake">
                    {errors.identifier}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 group-hover:scale-110 group-focus-within:scale-110"
                    style={{ color: "rgba(59, 130, 246, 0.7)" }}
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((prev) => ({
                          ...prev,
                          password: undefined,
                        }));
                    }}
                    className={`pl-12 pr-12 h-14 rounded-xl border-2 bg-white/70 backdrop-blur-sm font-medium text-gray-700 placeholder:text-gray-400 transition-all duration-300 hover:shadow-md focus:shadow-lg ${
                      errors.password
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={
                      !errors.password
                        ? ({
                            "--tw-ring-color": "rgba(59, 130, 246, 0.2)",
                          } as React.CSSProperties)
                        : {}
                    }
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 hover:scale-110 disabled:opacity-50"
                    style={{ color: "rgba(59, 130, 246, 0.7)" }}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                    style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
                  ></div>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 font-medium animate-shake">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] rounded-xl border-0 text-white"
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing you in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </div>
            </form>

            {/* Decorative bottom element */}
            <div className="flex justify-center pt-4">
              <div
                className="w-24 h-1 rounded-full opacity-30"
                style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
