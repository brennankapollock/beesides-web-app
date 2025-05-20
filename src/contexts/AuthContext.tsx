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
import { createUserProfile } from "../hooks/useAppwriteProfile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionInitialized, setSessionInitialized] = useState(false);

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

  // Enhanced session management with retry logic and better error handling
  useEffect(() => {
    // Skip if we've already initialized the session
    if (sessionInitialized) {
      return;
    }
    
    const fetchSession = async () => {
      setLoading(true);
      logger.info("Initializing and fetching Appwrite session", {
        category: "auth",
      });
      
      try {
        // Get the user account directly - if this succeeds, we have a valid session
        const acc = await account.get();
        setCurrentUser(mapAppwriteUserToAuthUser(acc));
        
        logger.info("Valid Appwrite session found", {
          category: "auth",
          data: { userId: acc.$id },
        });
      } catch (error) {
        // Handle specific error types
        if (error instanceof Error) {
          if (error.message.includes('Session not found')) {
            logger.info("No active session found", { category: "auth" });
          } else if (error.message.includes('Unauthorized')) {
            logger.info("Session expired or invalid", { category: "auth" });
          } else {
            logger.error("Error fetching session", {
              category: "auth",
              data: { error: error.message },
            });
          }
        } else {
          logger.error("Unknown error fetching session", {
            category: "auth",
            data: { error: String(error) },
          });
        }
        
        // We can't directly recover with JWT in this version of Appwrite
        // Instead, we'll try to use the stored credentials if available
        try {
          const storedEmail = localStorage.getItem('auth_email');
          const storedPassword = localStorage.getItem('auth_password');
          
          if (storedEmail && storedPassword) {
            // Try to create a new session with stored credentials
            await account.createEmailSession(storedEmail, storedPassword);
            const acc = await account.get();
            setCurrentUser(mapAppwriteUserToAuthUser(acc));
            logger.info("Recovered session using stored credentials", {
              category: "auth",
              data: { userId: acc.$id },
            });
            return;
          }
        } catch (recoveryError) {
          logger.error("Failed to recover session", {
            category: "auth",
            data: { error: recoveryError instanceof Error ? recoveryError.message : String(recoveryError) },
          });
        }
        
        setCurrentUser(null);
      } finally {
        setLoading(false);
        setSessionInitialized(true);
      }
    };
    
    fetchSession();
    
    // Set up event listeners for auth state changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && sessionInitialized) {
        // Only check session on visibility change if we've already initialized
        // This prevents unnecessary flickering during initial page load
        fetchSession();
      }
    };
    
    // Check session when tab becomes visible again
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mapAppwriteUserToAuthUser, sessionInitialized]);

  const signUp = async (
    credentials: SignUpCredentials
  ): Promise<AuthUser | null> => {
    setLoading(true);
    logger.info("Starting sign-up process", {
      category: "auth",
      data: { email: credentials.email },
    });
    try {
      // Create the user account
      const newUser = await account.create(
        "unique()",
        credentials.email,
        credentials.password,
        credentials.name
      );

      logger.info("User account created successfully", {
        category: "auth",
        data: { userId: newUser.$id },
      });

      // Automatically sign in the user after successful registration
      try {
        await account.createEmailSession(credentials.email, credentials.password);
        
        // Store credentials for recovery (encrypt in production)
        localStorage.setItem('auth_email', credentials.email);
        localStorage.setItem('auth_password', credentials.password);
        
        logger.info("Email session created after registration", {
          category: "auth",
          data: { userId: newUser.$id },
        });

        // Get the user account to ensure we have the latest data
        const userAccount = await account.get();
        const authUser = mapAppwriteUserToAuthUser(userAccount);

        // Create a user profile in the database
        try {
          await createUserProfile({
            userId: authUser.id,
            name: authUser.name || authUser.email.split('@')[0],
            email: authUser.email,
            phone: credentials.phone
          });
          
          logger.info("User profile created successfully", {
            category: "auth",
            data: { userId: authUser.id },
          });
        } catch (profileError) {
          logger.error("Failed to create user profile", {
            category: "auth",
            data: {
              error: profileError instanceof Error ? profileError.message : String(profileError),
              userId: authUser.id
            },
          });
          // Continue even if profile creation fails
        }

        // Set the current user
        setCurrentUser(authUser);
        return authUser;
      } catch (sessionError) {
        logger.error("Failed to create session after registration", {
          category: "auth",
          data: {
            error: sessionError instanceof Error ? sessionError.message : String(sessionError),
            userId: newUser.$id
          },
        });
        
        // Even if session creation fails, we can still return the user
        const authUser: AuthUser = {
          id: newUser.$id,
          email: newUser.email,
          name: newUser.name,
          username: newUser.name,
          created_at: newUser.$createdAt,
        };
        
        setCurrentUser(authUser);
        return authUser;
      }
    } catch (error: unknown) {
      logger.error("Sign-up failed", {
        category: "auth",
        data: {
          error: error instanceof Error ? error.message : String(error),
          email: credentials.email
        },
      });
      
      setCurrentUser(null);
      throw new Error("Sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (
    credentials: SignInCredentials
  ): Promise<AuthUser | null> => {
    setLoading(true);
    logger.info("Starting sign-in process", {
      category: "auth",
      data: { email: credentials.email },
    });
    try {
      // Create an email session
      await account.createEmailSession(credentials.email, credentials.password);
      
      // Store credentials for recovery (encrypt in production)
      localStorage.setItem('auth_email', credentials.email);
      localStorage.setItem('auth_password', credentials.password);
      
      logger.info("Email session created", {
        category: "auth",
        data: { email: credentials.email },
      });

      // Get the user account
      const userAccount = await account.get();
      const authUser = mapAppwriteUserToAuthUser(userAccount);

      // Check if this is a new user (coming from registration)
      if (credentials.isNewUser) {
        // Create a user profile in the database if it doesn't exist
        try {
          await createUserProfile({
            userId: authUser.id,
            name: authUser.name || authUser.email.split('@')[0],
            email: authUser.email
          });
          
          logger.info("User profile created for new user", {
            category: "auth",
            data: { userId: authUser.id },
          });
        } catch (profileError) {
          logger.error("Failed to create user profile for new user", {
            category: "auth",
            data: {
              error: profileError instanceof Error ? profileError.message : String(profileError),
              userId: authUser.id
            },
          });
          // Continue even if profile creation fails
        }
      }

      // Set the current user
      setCurrentUser(authUser);
      logger.info("User signed in successfully", {
        category: "auth",
        data: { userId: authUser.id },
      });
      return authUser;
    } catch (error: unknown) {
      logger.error("Sign-in failed", {
        category: "auth",
        data: {
          error: error instanceof Error ? error.message : String(error),
          email: credentials.email
        },
      });
      
      setCurrentUser(null);
      throw new Error("Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    logger.info("Signing out user", {
      category: "auth",
      data: { userId: currentUser?.id },
    });
    try {
      await account.deleteSession("current");
      setCurrentUser(null);
      localStorage.removeItem('auth_email');
      localStorage.removeItem('auth_password');
      logger.info("User signed out successfully", {
        category: "auth",
      });
    } catch (error: unknown) {
      logger.error("Sign-out failed", {
        category: "auth",
        data: { error: error instanceof Error ? error.message : String(error) },
      });
      // Even if the API call fails, we should still clear the local state
      // to prevent UI inconsistencies
      setCurrentUser(null);
      localStorage.removeItem('auth_email');
      localStorage.removeItem('auth_password');
      throw new Error("Sign-out failed");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    setLoading(true);
    logger.info("Initiating Google Sign-In", {
      category: "auth",
    });
    try {
      await account.createOAuth2Session(
        OAuthProvider.Google,
        window.location.origin + "/auth/callback",
        window.location.origin + "/auth/callback/error"
      );
      // Note: This function redirects the user, so we don't need to handle success here
      // The redirect callback will handle setting the user
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
    // Don't set loading to true if we already have a user
    // This prevents unnecessary UI flickering when rechecking auth status
    if (!currentUser) {
      setLoading(true);
    }
    
    logger.info("Explicitly checking auth status with Appwrite", {
      category: "auth",
    });
    try {
      const userAccount = await account.get();
      const authUser = mapAppwriteUserToAuthUser(userAccount);
      setCurrentUser(authUser);
      setSessionInitialized(true);
      
      // Ensure user has a profile in the database
      try {
        await createUserProfile({
          userId: authUser.id,
          name: authUser.name || authUser.email.split('@')[0],
          email: authUser.email
        });
        // This will either create a new profile or return the existing one if it already exists
      } catch (profileError) {
        logger.error("Failed to ensure user profile exists", {
          category: "auth",
          data: {
            error: profileError instanceof Error ? profileError.message : String(profileError),
            userId: authUser.id
          },
        });
        // Continue even if profile creation fails
      }
      
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

  // Add updateProfile function
  const updateProfile = async (data: Partial<AuthUser>): Promise<void> => {
    setLoading(true);
    logger.info("Updating user profile", {
      category: "auth",
      data: { userId: currentUser?.id },
    });
    try {
      // Implementation depends on your API structure
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for session management
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update the current user state with the new data
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
      logger.info("User profile updated successfully", {
        category: "auth",
        data: { userId: currentUser?.id },
      });
    } catch (error: unknown) {
      logger.error("Profile update failed", {
        category: "auth",
        data: { error: error instanceof Error ? error.message : String(error) },
      });
      throw new Error("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  // Add getProfile function
  const getProfile = async (): Promise<AuthUser | null> => {
    setLoading(true);
    logger.info("Fetching user profile", {
      category: "auth",
      data: { userId: currentUser?.id },
    });
    try {
      return await checkAuthStatus(); // Reuse the existing auth check function
    } catch (error: unknown) {
      logger.error("Profile fetch failed", {
        category: "auth",
        data: { error: error instanceof Error ? error.message : String(error) },
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    isLoading: loading, // Add isLoading as alias for loading
    isAuthenticated: !!currentUser, // Add isAuthenticated property
    isSessionInitialized: sessionInitialized, // Add flag to indicate if session has been initialized
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    checkAuthStatus,
    updateProfile,
    getProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
