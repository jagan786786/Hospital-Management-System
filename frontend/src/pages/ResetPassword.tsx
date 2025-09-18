import React, { useState } from "react";
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
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateEmployee } from "../api/services/employeService";
import { useNavigate, useParams } from "react-router-dom";

const ResetPasswordPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const { toast } = useToast();

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach((check) => {
      if (check) strength++;
    });

    return { strength, checks };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const getStrengthLabel = (strength: number) => {
    if (strength < 2) return { label: "Weak", color: "text-red-500" };
    if (strength < 4) return { label: "Fair", color: "text-yellow-500" };
    if (strength < 5) return { label: "Good", color: "text-blue-500" };
    return { label: "Strong", color: "text-green-500" };
  };

  const validateForm = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (passwordStrength.strength < 3) {
      newErrors.newPassword =
        "Password is too weak. Please add more complexity.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await updateEmployee(id!, { password: newPassword });
      toast({
        title: "Password reset successful!",
        description: "Your password has been updated successfully.",
      });
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const strengthInfo = getStrengthLabel(passwordStrength.strength);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
        ></div>
        <div
          className="absolute top-40 right-32 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
        ></div>
        <div
          className="absolute bottom-32 left-40 w-40 h-40 rounded-full opacity-10"
          style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-28 h-28 rounded-full opacity-10"
          style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg"
            style={{ backgroundColor: "rgba(59, 130, 246, 0.5)" }}
          >
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            Create a new secure password for your account
          </p>
        </div>

        {/* Reset Password Card */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="space-y-4 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Set New Password
            </CardTitle>
            <CardDescription className="text-gray-600">
              Choose a strong password to secure your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-semibold text-gray-700"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword)
                        setErrors((prev) => ({
                          ...prev,
                          newPassword: undefined,
                        }));
                    }}
                    className={`pl-12 pr-12 h-12 border-2 transition-all duration-200 ${
                      errors.newPassword
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onFocus={(e) => {
                      if (!errors.newPassword) {
                        e.target.style.borderColor = "rgba(59, 130, 246, 0.5)";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "";
                      e.target.style.boxShadow = "";
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        Password strength:
                      </span>
                      <span
                        className={`text-xs font-semibold ${strengthInfo.color}`}
                      >
                        {strengthInfo.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.strength < 2
                            ? "bg-red-500"
                            : passwordStrength.strength < 4
                            ? "bg-yellow-500"
                            : passwordStrength.strength < 5
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${(passwordStrength.strength / 5) * 100}%`,
                        }}
                      ></div>
                    </div>

                    {/* Password Requirements */}
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div
                        className={`flex items-center space-x-2 ${
                          passwordStrength.checks.length
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {passwordStrength.checks.length ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>At least 8 characters</span>
                      </div>
                      <div
                        className={`flex items-center space-x-2 ${
                          passwordStrength.checks.uppercase &&
                          passwordStrength.checks.lowercase
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {passwordStrength.checks.uppercase &&
                        passwordStrength.checks.lowercase ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>Upper and lowercase letters</span>
                      </div>
                      <div
                        className={`flex items-center space-x-2 ${
                          passwordStrength.checks.numbers
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {passwordStrength.checks.numbers ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>At least one number</span>
                      </div>
                      <div
                        className={`flex items-center space-x-2 ${
                          passwordStrength.checks.special
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {passwordStrength.checks.special ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>Special character (!@#$%^&*)</span>
                      </div>
                    </div>
                  </div>
                )}

                {errors.newPassword && (
                  <p className="text-sm text-red-500">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-gray-700"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors((prev) => ({
                          ...prev,
                          confirmPassword: undefined,
                        }));
                    }}
                    className={`pl-12 pr-12 h-12 border-2 transition-all duration-200 ${
                      errors.confirmPassword
                        ? "border-red-400 focus:border-red-500"
                        : confirmPassword && newPassword === confirmPassword
                        ? "border-green-400 focus:border-green-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onFocus={(e) => {
                      if (!errors.confirmPassword) {
                        e.target.style.borderColor = "rgba(59, 130, 246, 0.5)";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "";
                      e.target.style.boxShadow = "";
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div
                    className={`flex items-center space-x-2 text-xs ${
                      newPassword === confirmPassword
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {newPassword === confirmPassword ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    <span>
                      {newPassword === confirmPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </span>
                  </div>
                )}

                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                style={{
                  backgroundColor: isLoading
                    ? "rgba(59, 130, 246, 0.3)"
                    : "rgba(59, 130, 246, 0.5)",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor =
                      "rgba(59, 130, 246, 0.7)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor =
                      "rgba(59, 130, 246, 0.5)";
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Your password will be encrypted and stored securely
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
