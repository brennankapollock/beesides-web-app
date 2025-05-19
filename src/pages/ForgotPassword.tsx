import React, { useState } from "react";
import { Link } from "../components/Link";
import { useAuth } from "../hooks/useAuth";
import { account } from "../lib/appwrite";
import { logger } from "../utils/logger";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      logger.info("Initiating password recovery", {
        category: "auth",
        data: { email },
      });

      // Use Appwrite's password recovery
      const promise = await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
      
      logger.info("Password recovery email sent", {
        category: "auth",
        data: { email },
      });
      
      setSuccess(true);
    } catch (err) {
      logger.error("Password recovery failed", {
        category: "auth",
        data: { 
          email,
          error: err instanceof Error ? err.message : String(err)
        },
      });
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send recovery email. Please try again later.");
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
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
              <p className="font-medium">Recovery email sent!</p>
              <p className="mt-1">
                Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
              </p>
              <div className="mt-4">
                <Link to="/login" className="text-black font-bold hover:underline">
                  Return to login
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
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send recovery email"}
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

export default ForgotPassword;
