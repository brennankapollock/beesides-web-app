import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { account } from "../lib/appwrite";
import { logger } from "../utils/logger";

export function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract userId and secret from URL query parameters
  const [userId, setUserId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userIdParam = params.get("userId");
    const secretParam = params.get("secret");

    if (userIdParam && secretParam) {
      setUserId(userIdParam);
      setSecret(secretParam);
    } else {
      setError("Invalid password reset link. Please request a new one.");
    }
  }, [location]);

  const getPasswordStrength = () => {
    if (!password)
      return {
        strength: 0,
        text: "",
      };
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    const strengthText = ["Weak", "Fair", "Good", "Strong"];
    return {
      strength,
      text: strengthText[strength - 1] || "",
    };
  };
  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form fields
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!userId || !secret) {
      setError("Invalid password reset link. Please request a new one.");
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      logger.info("Attempting to reset password", {
        category: "auth",
        data: { userId },
      });

      // Use Appwrite's password recovery confirmation
      await account.updateRecovery(userId, secret, password, password);
      
      logger.info("Password reset successful", {
        category: "auth",
        data: { userId },
      });
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      logger.error("Password reset failed", {
        category: "auth",
        data: { 
          userId,
          error: err instanceof Error ? err.message : String(err)
        },
      });
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to reset password. The link may have expired. Please request a new one.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="p-4 md:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            BEESIDES
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Reset your password</h1>
            <p className="text-gray-600">
              Create a new password for your account
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
              <p className="font-medium">Password reset successful!</p>
              <p className="mt-1">
                Your password has been reset. You will be redirected to the login page in a few seconds.
              </p>
              <div className="mt-4">
                <Link to="/login" className="text-black font-bold hover:underline">
                  Go to login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black pr-10"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? (
                        <EyeOffIcon size={18} />
                      ) : (
                        <EyeIcon size={18} />
                      )}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm">Password strength:</div>
                        <div
                          className={`text-sm font-medium ${
                            passwordStrength.strength < 2
                              ? "text-red-500"
                              : passwordStrength.strength < 4
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {passwordStrength.text}
                        </div>
                      </div>
                      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            passwordStrength.strength < 2
                              ? "bg-red-500"
                              : passwordStrength.strength < 4
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${(passwordStrength.strength / 4) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black pr-10"
                      placeholder="••••••••"
                      required
                    />
                    {confirmPassword && password === confirmPassword && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !userId || !secret}
                  className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resetting password..." : "Reset Password"}
                </button>
              </form>
              <div className="mt-8 pt-6 border-t text-center">
                <p>
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-black font-bold hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Beesides. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ResetPassword;
