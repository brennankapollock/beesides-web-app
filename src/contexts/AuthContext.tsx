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
    
    // Clean up event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

      // Use the VITE_BEESIDES_API_URL env variable or fallback to the proxy
      const apiBase = "/api"; // This uses the Vite proxy

      const response = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiCredentials),
        credentials: "include", // Include cookies for session management
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage =
            errorData.message || `Sign up failed via API (${response.status})`;
        } catch (e) {
          errorMessage = `Sign up failed: ${response.status} - ${
            errorText || "Unknown error"
          }`;
        }
        throw new Error(errorMessage);
      }

      // Log successful API response
      console.log("User registered successfully via API");
      const responseData = await response.json();
      console.log("Registration response:", responseData);

      // Set flags to indicate this is a new user that needs onboarding
      sessionStorage.setItem("needs_onboarding", "true");
      sessionStorage.setItem("registration_complete", "true");

      // If we have a session from the API, use it to create a session with Appwrite
      if (responseData.session && responseData.user) {
        try {
          logger.info("User registered via API, attempting login to sync Appwrite SDK", { 
            category: "auth", 
            data: { email: credentials.email } 
          });
          
          // Instead of trying to get the account immediately, we need to sign in first
          // We'll use the signIn function which we know works
          logger.info("Attempting user sign in via API", {
            category: "auth",
            data: { email: credentials.email }
          });
          
          // Create an auth user object from the API response
          const authUser = {
            id: responseData.user.$id,
            email: responseData.user.email,
            name: responseData.user.name,
            phone: responseData.user.phone || undefined,
            username: responseData.user.name,
            created_at: responseData.user.$createdAt,
          };
          
          setCurrentUser(authUser);

          // Create user profile in the database
          try {
            logger.info("Creating user profile in database", {
              category: "auth",
              data: { userId: authUser.id },
            });
            
            await createUserProfile({
              userId: authUser.id,
              name: authUser.name || authUser.email.split('@')[0],
              email: authUser.email
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
            // Continue even if profile creation fails, we can try again later
          }

          logger.info("User authenticated successfully after registration", {
            category: "auth",
            data: { userId: authUser.id },
          });

          // Return the authUser instead of navigating directly
          // This allows the Register component to handle navigation while maintaining state
          setLoading(false);
          return authUser;
        } catch (sessionError) {
          logger.error("Failed to create Appwrite session after registration", {
            category: "auth",
            data: {
              error: sessionError instanceof Error ? sessionError.message : String(sessionError),
            },
          });
          // Fall back to regular sign in
        }
      }

      logger.info(
        "User registered via API, attempting login to sync Appwrite SDK",
        { category: "auth", data: { email: credentials.email } }
      );
      return await signIn({
        email: credentials.email,
        password: credentials.password,
        isNewUser: true, // Pass flag to indicate this is a new registration
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
      // Use the same apiBase as for registration
      const apiBase = "/api"; // This uses the Vite proxy

      console.log(
        `Attempting to login via ${apiBase}/auth/login with email: ${credentials.email}`
      );

      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include", // Include cookies for session management
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage =
            errorData.message || `Sign in failed via API (${response.status})`;
        } catch (e) {
          errorMessage = `Sign in failed: ${response.status} - ${
            errorText || "Unknown error"
          }`;
        }
        console.error("Login error response:", errorText);
        throw new Error(errorMessage);
      }

      // Log successful login
      console.log("Login successful via API");
      try {
        // Parse response JSON only once
        const loginData = await response.json();
        console.log("Login response data:", loginData);

        // Extract user data from login response
        const user = loginData.user;

        if (!user) {
          throw new Error("Login response did not contain user data");
        }

        // Create a session with Appwrite using the email/password to ensure SDK state is synced
        try {
          // Create an Appwrite session to ensure the SDK is properly authenticated
          const session = await account.createEmailSession(
            credentials.email,
            credentials.password
          );
          
          // Store credentials in localStorage for session recovery if needed
          // Note: In a production app, you might want to use a more secure storage method
          // or implement a proper token refresh mechanism
          try {
            localStorage.setItem('auth_email', credentials.email);
            localStorage.setItem('auth_password', credentials.password);
            console.log("Credentials stored for session persistence");
          } catch (storageError) {
            console.error("Failed to store credentials for session persistence:", storageError);
            // Continue even if storage fails
          }
          
          logger.info("Appwrite session created successfully", {
            category: "auth",
            data: { sessionId: session.$id },
          });
        } catch (sessionError) {
          console.error("Failed to create Appwrite session:", sessionError);
          // Continue even if session creation fails, as we still have the API response
        }

        // Create auth user from the response
        const authUser = mapAppwriteUserToAuthUser(user);

        // If this is a new user from registration, mark them for onboarding
        if (credentials.isNewUser) {
          sessionStorage.setItem("needs_onboarding", "true");
          sessionStorage.setItem("registration_complete", "true");
          console.log(
            "New user detected, marking for onboarding flow with flags:",
            {
              needs_onboarding: sessionStorage.getItem("needs_onboarding"),
              registration_complete: sessionStorage.getItem(
                "registration_complete"
              ),
            }
          );
        }

        setCurrentUser(authUser);

        logger.info("User signed in via API successfully", {
          category: "auth",
          data: { userId: authUser.id },
        });

        setLoading(false);
        return authUser;
      } catch (error) {
        console.error("Error processing login response:", error);

        // Fallback to getting user from Appwrite (this may not work if the API call succeeded but Appwrite sync failed)
        try {
          const userAccount = await account.get();
          const authUser = mapAppwriteUserToAuthUser(userAccount);
          setCurrentUser(authUser);
          logger.info("User signed in via Appwrite SDK fallback", {
            category: "auth",
            data: { userId: authUser.id },
          });
          setLoading(false);
          return authUser;
        } catch (appwriteError) {
          console.error("Appwrite fallback failed:", appwriteError);
          throw new Error("Login succeeded but failed to get user details");
        }
      }
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
      // Delete all sessions to ensure complete logout
      await account.deleteSessions();
      
      // Remove stored credentials if they exist
      localStorage.removeItem('auth_email');
      localStorage.removeItem('auth_password');
      
      // Clear any session storage items related to auth
      sessionStorage.removeItem("needs_onboarding");
      sessionStorage.removeItem("registration_complete");
      
      // Update state
      setCurrentUser(null);
      
      logger.info("User signed out successfully", { category: "auth" });
    } catch (error: unknown) {
      logger.error("Sign out failed", {
        category: "auth",
        data: { error: error instanceof Error ? error.message : String(error) },
      });
      // Still clear user state even if API call fails
      setCurrentUser(null);
      
      // Still try to remove stored data
      try {
        localStorage.removeItem('auth_email');
        localStorage.removeItem('auth_password');
        sessionStorage.removeItem("needs_onboarding");
        sessionStorage.removeItem("registration_complete");
      } catch (cleanupError) {
        console.error("Failed to clean up local storage during sign out:", cleanupError);
      }
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
