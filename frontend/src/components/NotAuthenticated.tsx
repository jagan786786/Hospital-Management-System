import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Shield, Lock, ArrowLeft, Sparkles, AlertTriangle, Eye } from "lucide-react";

const NotAuthenticated = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showDetails, setShowDetails] = useState(false);

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleGoToLogin = () => {
    window.location.href = "/login";
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Animated Background - Same as login form */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary floating orbs */}
        <div
          className="absolute top-20 left-20 w-32 h-32 rounded-full animate-pulse transform hover:scale-110 transition-transform duration-500"
          style={{ backgroundColor: "rgba(239, 68, 68, 0.4)" }}
        ></div>
        <div
          className="absolute top-40 right-32 w-24 h-24 rounded-full animate-bounce transform hover:scale-110 transition-transform duration-500"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.4)",
            animationDelay: "1s",
          }}
        ></div>
        <div
          className="absolute bottom-32 left-40 w-40 h-40 rounded-full animate-pulse transform hover:scale-110 transition-transform duration-500"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.4)",
            animationDelay: "2s",
          }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-28 h-28 rounded-full animate-bounce transform hover:scale-110 transition-transform duration-500"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.4)",
            animationDelay: "0.5s",
          }}
        ></div>

        {/* Additional smaller orbs */}
        <div
          className="absolute top-60 left-10 w-16 h-16 rounded-full animate-ping"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.4)",
            animationDelay: "3s",
          }}
        ></div>
        <div
          className="absolute top-10 right-60 w-12 h-12 rounded-full animate-ping"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.4)",
            animationDelay: "1.5s",
          }}
        ></div>
        <div
          className="absolute bottom-60 right-10 w-20 h-20 rounded-full animate-ping"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.4)",
            animationDelay: "2.5s",
          }}
        ></div>

        {/* Interactive mouse follower */}
        <div
          className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background: `radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%)`,
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-4">
        {/* Header */}
        <div className="text-center mb-8 transform hover:scale-105 transition-transform duration-300">
          <div className="relative inline-block mb-6">
            <div
              className="absolute inset-0 w-28 h-28 rounded-full animate-spin-slow opacity-20"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.5)" }}
            ></div>
            <div
              className="relative flex items-center justify-center w-24 h-24 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.8)" }}
            >
              <Shield className="w-12 h-12 text-white" />
              <AlertTriangle className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-3 animate-fade-in">
            Access Denied
          </h1>
          <p className="text-gray-600 text-lg font-medium opacity-80">
            Authentication required to continue
          </p>
        </div>

        {/* Main Card */}
        <Card className="relative backdrop-blur-sm bg-white/90 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] overflow-hidden mb-6">
          {/* Card overlay */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.5)" }}
          ></div>

          <CardHeader className="relative space-y-4 text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center space-x-3">
              <Lock className="w-8 h-8 text-red-500" />
              <span>Not Authenticated</span>
            </CardTitle>
            <CardDescription className="text-gray-600 text-base font-medium">
              You need to sign in to access this protected content
            </CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-8">
            {/* Status Message */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-red-50 border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">Session Expired or Invalid</span>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                Your session has expired or you don't have permission to access this page. 
                Please sign in with your credentials to continue.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleGoToLogin}
                size="lg"
                className="w-full h-14 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] rounded-xl border-0 text-white"
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.8)",
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Sign In Now</span>
                  <Sparkles className="w-5 h-5" />
                </div>
              </Button>

              <Button
                onClick={handleGoHome}
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-medium border-2 border-gray-300 hover:border-gray-400 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 transform hover:scale-[1.01] rounded-xl"
              >
                <div className="flex items-center justify-center space-x-2">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Go to Homepage</span>
                </div>
              </Button>
            </div>

            {/* Details Section */}
            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors duration-300 w-full"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {showDetails ? "Hide Details" : "Show Details"}
                </span>
              </button>
              
              {showDetails && (
                <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200 animate-fade-in">
                  <h4 className="font-semibold text-gray-700 mb-2">What happened?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Your authentication session has expired</li>
                    <li>• You may not have the required permissions</li>
                    <li>• The page requires user authentication</li>
                    <li>• Your login token may be invalid</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Decorative bottom element */}
            <div className="flex justify-center pt-4">
              <div
                className="w-24 h-1 rounded-full opacity-30"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.5)" }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="backdrop-blur-sm bg-blue-50/70 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Need Help?</h4>
                <p className="text-sm text-blue-700">
                  If you continue to experience issues, please contact our support team or try clearing your browser cache.
                </p>
              </div>
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

export default NotAuthenticated;