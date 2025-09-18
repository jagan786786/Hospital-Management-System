// src/components/LoginForm.tsx
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/schemas/loginSchema";
import { loginUser } from "@/api/services/loginService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, Sparkles, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LoginPayload } from "@/types/auth";

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const { handleSubmit } = form;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    console.log(data);
    
    try {
      const response = await loginUser(data as LoginPayload);
      console.log(response);
      
      // ✅ correct: backend sends "roles"
      login(response.accessToken, response.refreshToken, {
        id: response.id,
        name: response.name,
        roles: response.roles || [],
        type: response.type,
      });

      toast.success(`Welcome back, ${response.name}!`);

      if (response.type === "patient") {
        navigate("/patient-onboarding");
      } else {
        navigate("/employee-onboarding");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary floating orbs */}
        <div
          className="absolute top-20 left-20 w-32 h-32 rounded-full animate-pulse transform hover:scale-110 transition-transform duration-500"
          style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
        />
        <div
          className="absolute top-40 right-32 w-24 h-24 rounded-full animate-bounce transform hover:scale-110 transition-transform duration-500"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute bottom-32 left-40 w-40 h-40 rounded-full animate-pulse transform hover:scale-110 transition-transform duration-500"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute bottom-20 right-20 w-28 h-28 rounded-full animate-bounce transform hover:scale-110 transition-transform duration-500"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            animationDelay: "0.5s",
          }}
        />

        {/* Smaller orbs */}
        <div
          className="absolute top-60 left-10 w-16 h-16 rounded-full animate-ping"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            animationDelay: "3s",
          }}
        />
        <div
          className="absolute top-10 right-60 w-12 h-12 rounded-full animate-ping"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            animationDelay: "1.5s",
          }}
        />
        <div
          className="absolute bottom-60 right-10 w-20 h-20 rounded-full animate-ping"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            animationDelay: "2.5s",
          }}
        />

        {/* Mouse follower */}
        <div
          className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background: `radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)`,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Header */}
        <div className="text-center mb-8 transform hover:scale-105 transition-transform duration-300">
          <div className="relative inline-block mb-6">
            <div
              className="absolute inset-0 w-24 h-24 rounded-full animate-spin-slow opacity-20"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
            />
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
          <CardHeader className="relative space-y-4 text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-800">
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-600 text-base font-medium">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-8">
            {/* ✅ Use FormProvider */}
            <FormProvider {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Identifier Field */}
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email or Phone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                          <Input
                            {...field}
                            placeholder="Enter your email or phone number"
                            className="pl-12"
                            autoComplete="username"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-12 pr-12"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2"
                            disabled={isSubmitting}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] rounded-xl border-0 text-white"
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
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
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-5px);} 75%{transform:translateX(5px);} }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .shadow-3xl { box-shadow: 0 35px 60px -12px rgba(0,0,0,0.25); }
      `}</style>
    </div>
  );
}
