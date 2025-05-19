// filepath: /Users/brennanpollock/Projects/lush-rust-studios/beesides-web-app-1.0/src/contexts/AuthContext.tsx
import React, { useEffect, useState, useCallback } from "react";
import { account } from "../lib/appwrite";
import { Models } from "appwrite";
import { OAuthProvider } from "appwrite";
import {
  AuthContext,
  AuthUser,
  SignUpCredentials,
  SignInCredentials,
  AuthContextType,
  AppwriteUser,
} from "./AuthContextTypes";
import { logger } from "../utils/logger";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const mapAppwriteUserToAuthUser = useCallback(
    (appwriteUser: AppwriteUser | Models.Session): AuthUser => {
      let userDetails: AppwriteUser;
      if ("providerUid" in appwriteUser) {
        userDetails = appwriteUser as unknown as AppwriteUser;
      } else {
        userDetails = appwriteUser as AppwriteUser;
      }

      return {
        id: userDetails.$id,
        email: userDetails.email,
        name: userDetails.name,
        phone: userDetails.phone || undefined,
        username: userDetails.name,
        created_at: userDetails.$createdAt,
      };
    },
    []
  );

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      logger.info("Initializing and fetching Appwrite session", {
        category: "auth",
      });
      try {
        const acc = await account.get();
        setCurrentUser(mapAppwriteUserToAuthUser(acc));
        logger.info("Valid Appwrite session found", {
          category: "auth",
          data: { userId: acc.$id },
        });
      } catch (error) {
        logger.info("No active Appwrite session or error fetching account", {
          category: "auth",
          data: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [mapAppwriteUserToAuthUser]);

  const signUp = async (
    credentials: SignUpCredentials
  ): Promise<AuthUser | null> => {
    setLoading(true);
    logger.info("Attempting user sign up via API", {
      category: "auth",
      data: { email: credentials.email },
    });
    try {
      // Ensure username is not part of the credentials sent to the API
      const { email, password, name, phone } = credentials;
      const apiCredentials = { email, password, name, phone };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiCredentials),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sign up failed via API");
      }
      logger.info(
        "User registered via API, attempting login to sync Appwrite SDK",
        { category: "auth", data: { email: credentials.email } }
      );
      return await signIn({
        email: credentials.email,
        password: credentials.password,
      });
    } catch (error: unknown) {
      logger.error("Sign up failed", {
        category: "auth",
        data: { error: error instanceof Error ? error.message : String(error) },
      });
      setCurrentUser(null);
      setLoading(false);
      if (error instanceof Error) throw error;
      throw new Error(String(error));
    }
  };

  const signIn = async (
    credentials: SignInCredentials
  ): Promise<AuthUser | null> => {
    setLoading(true);
    logger.info("Attempting user sign in via API", {
      category: "auth",
      data: { email: credentials.email },
    });
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sign in failed via API");
      }
      const userAccount = await account.get();
      const authUser = mapAppwriteUserToAuthUser(userAccount);
      setCurrentUser(authUser);
      logger.info("User signed in via API and Appwrite SDK synced", {
        category: "auth",
        data: { userId: authUser.id },
      });
      setLoading(false);
      return authUser;
    } catch (error: unknown) {
      logger.error("Sign in failed", {
        category: "auth",
        data: { error: error instanceof Error ? error.message : String(error) },
      });
      setCurrentUser(null);
      setLoading(false);
      if (error instanceof Error) throw error;
      throw new Error(String(error));
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    logger.info("Attempting user sign out with Appwrite", { category: "auth" });
    try {
      await account.deleteSession("current");
      setCurrentUser(null);
      logger.info("User signed out successfully", { category: "auth" });
    } catch (error: unknown) {
      logger.error("Sign out failed", {
        category: "auth",
        data: { error: error instanceof Error ? error.message : String(error) },
      });
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    logger.info("Attempting Google Sign-In with Appwrite", {
      category: "auth",
    });
    try {
      account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/login?error=oauth_failed`,
        []
      );
    } catch (error: unknown) {
      logger.error("Google Sign-In failed to initiate", {
        category: "auth",
        data: { error: error instanceof Error ? error.message : String(error) },
      });
      setLoading(false);
      if (error instanceof Error) throw error;
      throw new Error(String(error));
    }
  };

  // Add checkAuthStatus function to explicitly check authentication status
  const checkAuthStatus = async (): Promise<AuthUser | null> => {
    setLoading(true);
    logger.info("Explicitly checking auth status with Appwrite", {
      category: "auth",
    });
    try {
      const userAccount = await account.get();
      const authUser = mapAppwriteUserToAuthUser(userAccount);
      setCurrentUser(authUser);
      logger.info("Auth status checked successfully", {
        category: "auth",
        data: { userId: authUser.id },
      });
      return authUser;
    } catch (error: unknown) {
      logger.error("Auth status check failed", {
        category: "auth",
        data: { error: error instanceof Error ? error.message : String(error) },
      });
      setCurrentUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get user profile data
  const getProfile = async (): Promise<AuthUser | null> => {
    if (!currentUser) return null;

    try {
      // In a real app with profile data, you'd fetch from the database here
      return currentUser;
    } catch (error) {
      logger.error("Failed to fetch user profile", {
        category: "auth",
        data: { userId: currentUser.id, error },
      });
      return currentUser; // Fall back to basic user data
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<AuthUser>): Promise<void> => {
    if (!currentUser) throw new Error("Not authenticated");

    try {
      // In a real implementation, you'd update the database here
      // For now, just update the local state
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    } catch (error) {
      logger.error("Failed to update profile", {
        category: "auth",
        data: { error },
      });
      throw new Error("Failed to update profile");
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    isLoading: loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    checkAuthStatus,
    getProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
