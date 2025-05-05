import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import { AuthContext, AuthUser } from "./AuthContextTypes";
import { logger } from "../utils/logger";
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Check for existing session on load
  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      logger.info("Initializing and fetching auth session", {
        category: "auth",
        data: { action: "initialize" },
      });

      try {
        // First check for a valid user
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) {
          logger.error("Failed to fetch user", {
            category: "auth",
            data: { error: userError },
          });
          setLoading(false);
          return;
        }

        // Get session from Supabase
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          logger.error("Failed to fetch session", {
            category: "auth",
            data: { error },
          });
          setLoading(false);
          return;
        }

        logger.debug("Auth state check", {
          category: "auth",
          data: {
            hasValidUser: !!userData.user,
            hasValidSession: !!session,
            userId: userData.user?.id || "none",
          },
        });

        if (session && userData.user) {
          logger.info("Valid session found", {
            category: "auth",
            data: {
              userId: session.user.id,
              expiresAt: session.expires_at,
              providerToken: !!session.provider_token,
              providerRefreshToken: !!session.provider_refresh_token,
              tokenType: session.token_type,
            },
          });

          logger.debug("User data from auth", {
            category: "auth",
            data: {
              id: userData.user.id,
              email: userData.user.email,
              phone: userData.user.phone,
              role: userData.user.role,
              emailConfirmedAt: userData.user.email_confirmed_at,
              lastSignInAt: userData.user.last_sign_in_at,
              hasUserMetadata: !!userData.user.user_metadata,
              hasAppMetadata: !!userData.user.app_metadata,
            },
          });

          logger.info("Fetching user profile for authenticated user", {
            category: "auth",
            data: { userId: userData.user.id },
          });
          await fetchUserProfile(userData.user);

          // Final sanity check
          logger.debug("Profile fetch completed", {
            category: "auth",
            data: { hasCurrentUser: !!currentUser },
          });
          setLoading(false); // Ensure loading is false after profile fetch
        } else {
          logger.info("No active session found", {
            category: "auth",
            data: { status: "unauthenticated" },
          });
          setCurrentUser(null);
          setLoading(false);
        }
      } catch (err) {
        logger.error("Unexpected error in fetchSession", {
          category: "auth",
          data: { error: err },
        });
        setLoading(false);
      }
    };

    fetchSession();

    // Set up auth state change listener
    logger.info("Setting up auth state change listener", {
      category: "auth",
      data: { action: "setupListener" },
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info(`Auth state changed: ${event}`, {
        category: "auth",
        data: {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          timestamp: new Date().toISOString(),
        },
      });

      // Always update loading state on auth events
      setLoading(true);

      if (event === "SIGNED_IN" && session) {
        logger.info("User signed in, fetching profile data", {
          category: "auth",
          data: {
            event: "SIGNED_IN",
            userId: session.user.id,
            email: session.user.email,
            timestamp: new Date().toISOString(),
          },
        });

        try {
          // Get fresh user data
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();

          if (error) {
            logger.error("Failed to get user after sign in event", {
              category: "auth",
              data: { error },
            });
            setLoading(false);
            return;
          }

          if (user) {
            logger.debug("Retrieved fresh user data", {
              category: "auth",
              data: { userId: user.id },
            });
            await fetchUserProfile(user);
          } else {
            logger.warn("No user found after SIGNED_IN event", {
              category: "auth",
              data: { event: "SIGNED_IN", status: "missing_user" },
            });
            setLoading(false);
          }
        } catch (err) {
          logger.error("Error handling sign in event", {
            category: "auth",
            data: { error: err },
          });
          setLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        logger.info("User signed out event received", {
          category: "auth",
          data: { event: "SIGNED_OUT", action: "clearing_user" },
        });
        setCurrentUser(null);
        setLoading(false);

        // Force a page reload when user is signed out
        logger.info("Forcing page reload after SIGNED_OUT event", {
          category: "auth",
          data: { action: "page_reload", trigger: "auth_state_change" },
        });

        // Small delay to ensure state updates are processed
        setTimeout(() => {
          window.location.replace("/");
        }, 100);
      } else if (event === "USER_UPDATED" && session) {
        logger.info("User updated event received, refreshing profile data", {
          category: "auth",
          data: {
            userId: session.user.id,
            timestamp: new Date().toISOString(),
          },
        });
        try {
          await fetchUserProfile(session.user);
        } catch (error) {
          logger.error("Error refreshing profile after USER_UPDATED", {
            category: "auth",
            data: { error },
          });
        } finally {
          setLoading(false);
        }
      } else if (event === "TOKEN_REFRESHED" && session) {
        logger.info("Token refreshed event received", {
          category: "auth",
          data: {
            userId: session.user.id,
            timestamp: new Date().toISOString(),
          },
        });
        setLoading(false);
      } else if (event === "PASSWORD_RECOVERY" && session) {
        logger.info("Password recovery event received", {
          category: "auth",
          data: { userId: session.user.id },
        });
        setLoading(false);
      } else {
        logger.warn("Unhandled auth event", {
          category: "auth",
          data: {
            event,
            hasSession: !!session,
            userId: session?.user?.id,
            timestamp: new Date().toISOString(),
          },
        });
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up auth state subscription");
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Fetch user profile data from profiles table
  // Add a timeout for profile fetching to prevent hanging
  const fetchProfileTimeout = (
    promise: Promise<void>,
    timeoutMs = 2000
  ): Promise<void> => {
    return Promise.race([
      promise,
      new Promise<void>((_, reject) => {
        setTimeout(() => {
          console.warn(`Profile fetch timed out after ${timeoutMs}ms`);
          reject(new Error(`Profile fetch timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  };

  const fetchUserProfile = async (user: User) => {
    // Create a promise for the actual fetch
    const fetchPromise = async () => {
      try {
        console.log("Fetching user profile for:", {
          userId: user.id,
          email: user.email,
          metadata: user.user_metadata,
        });

        // First try to get from user_stats view
        let data;
        let error;

        try {
          console.log("Attempting to fetch from user_stats view...");
          const result = await supabase
            .from("user_stats")
            .select("*")
            .eq("id", user.id)
            .single();

          data = result.data;
          error = result.error;

          console.log("user_stats view result:", {
            success: !error,
            dataFound: !!data,
            error: error?.message,
          });
        } catch (viewError) {
          console.warn(
            "Error fetching from user_stats view, falling back to profiles table:",
            viewError
          );
          // Fall back to profiles table if view has issues
          console.log("Attempting to fetch from profiles table...");
          const result = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          data = result.data;
          error = result.error;

          console.log("profiles table result:", {
            success: !error,
            dataFound: !!data,
            error: error?.message,
          });
        }

        if (error) {
          // If still no profile, create one
          if (error.code === "PGRST116") {
            console.log(
              "No profile found, creating new profile for user:",
              user.id
            );
            const username =
              user.user_metadata?.username || `user_${user.id.substring(0, 8)}`;
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert([
                {
                  id: user.id,
                  email: user.email,
                  name: user.user_metadata?.name || "",
                  username: username,
                  created_at: new Date(),
                },
              ])
              .select()
              .single();

            if (insertError) {
              console.error("Failed to create profile:", insertError);
              throw insertError;
            }

            console.log("New profile created successfully:", {
              profileId: newProfile?.id,
              email: newProfile?.email,
              name: newProfile?.name,
              username: newProfile?.username,
            });

            data = newProfile;
          } else {
            console.error("Unexpected error fetching profile:", error);
            throw error;
          }
        }

        // Create a fallback user profile if no data is available
        const fallbackProfile = {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || "",
          username:
            user.user_metadata?.username || `user_${user.id.substring(0, 5)}`,
          created_at: new Date().toISOString(),
          stats: {
            ratings: 0,
            reviews: 0,
            collections: 0,
            lists: 0,
            followers: 0,
            following: 0,
          },
        };

        const userProfile: AuthUser = {
          id: user.id,
          email: user.email || "",
          name: data?.name || user.user_metadata?.name || fallbackProfile.name,
          username:
            data?.username ||
            user.user_metadata?.username ||
            fallbackProfile.username,
          avatar: data?.avatar_url,
          bio: data?.bio,
          created_at: data?.created_at || fallbackProfile.created_at,
          stats: {
            ratings: data?.ratings_count || 0,
            reviews: data?.reviews_count || 0,
            collections: data?.collections_count || 0,
            lists: data?.lists_count || 0,
            followers: data?.followers_count || 0,
            following: data?.following_count || 0,
          },
        };

        console.log("User profile constructed:", {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          username: userProfile.username,
          hasAvatar: !!userProfile.avatar,
          hasBio: !!userProfile.bio,
          createdAt: userProfile.created_at,
          stats: userProfile.stats,
        });

        console.log("About to update current user in context:", userProfile);
        setCurrentUser(userProfile);
        console.log(
          "Current user updated in context. Is currentUser set?",
          !!userProfile
        );
      } catch (error) {
        console.error("Error fetching user profile:", error);

        // Set a minimal user profile even if we had an error
        const minimalProfile: AuthUser = {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || "",
          username:
            user.user_metadata?.username || `user_${user.id.substring(0, 5)}`,
          created_at: new Date().toISOString(),
          stats: {
            ratings: 0,
            reviews: 0,
            collections: 0,
            lists: 0,
            followers: 0,
            following: 0,
          },
        };

        console.log(
          "Setting minimal user profile after error:",
          minimalProfile
        );
        setCurrentUser(minimalProfile);
      } finally {
        setLoading(false);
      }
    };

    // Execute with timeout
    try {
      await fetchProfileTimeout(fetchPromise());
    } catch (error) {
      console.warn("Profile fetch timed out, setting minimal profile");

      // Create minimal profile on timeout
      const minimalProfile: AuthUser = {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.name || "",
        username:
          user.user_metadata?.username || `user_${user.id.substring(0, 5)}`,
        created_at: new Date().toISOString(),
        stats: {
          ratings: 0,
          reviews: 0,
          collections: 0,
          lists: 0,
          followers: 0,
          following: 0,
        },
      };

      setCurrentUser(minimalProfile);
      setLoading(false);
    }
  };

  // Sign in with email and password
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      logger.info("Login attempt initiated", {
        category: "auth",
        data: { email, action: "login_attempt" },
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error("Login failed", {
          category: "auth",
          data: {
            email,
            errorCode: error.code,
            errorMessage: error.message,
            status: "failed",
          },
        });
        throw error;
      }

      logger.info("Login successful", {
        category: "auth",
        data: {
          email,
          userId: data.user?.id,
          status: "success",
          hasSession: !!data.session,
        },
      });
      // User profile is fetched by the auth state change listener
    } catch (error) {
      logger.error("Unexpected error during login", {
        category: "auth",
        data: { error },
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  // Register new user
  const register = async (
    name: string,
    username: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    try {
      console.log("Starting registration process", {
        name,
        username,
        email,
        passwordLength: password ? password.length : 0,
      });

      // Create auth user with Supabase
      console.log("Calling supabase.auth.signUp with user data...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username,
          },
          // Ensure we automatically sign in after registration
          emailRedirectTo: window.location.origin + "/onboarding",
        },
      });

      console.log("Auth signup response received:", {
        success: !authError,
        userId: authData?.user?.id,
        userEmail: authData?.user?.email,
        sessionCreated: !!authData?.session,
        confirmationSent: authData?.user?.confirmation_sent_at,
        errorCode: authError?.code,
        errorMessage: authError?.message,
      });

      if (authError) {
        console.error("Registration error:", authError);
        throw authError;
      }

      if (!authData.user) {
        console.error("User creation failed - no user returned in auth data");
        throw new Error("User creation failed");
      }

      // Log user metadata and attributes
      console.log("User created successfully:", {
        id: authData.user.id,
        email: authData.user.email,
        createdAt: authData.user.created_at,
        lastSignInAt: authData.user.last_sign_in_at,
        metadata: authData.user.user_metadata,
        appMetadata: authData.user.app_metadata,
        emailConfirmedAt: authData.user.email_confirmed_at,
        confirmationSentAt: authData.user.confirmation_sent_at,
        recoveredAt: authData.user.recovery_sent_at,
      });

      // Set the user as currentUser for session
      const userProfile: AuthUser = {
        id: authData.user.id,
        email: email,
        name: name,
        username: username,
        created_at: new Date().toISOString(),
        stats: {
          ratings: 0,
          reviews: 0,
          collections: 0,
          lists: 0,
          followers: 0,
          following: 0,
        },
      };

      console.log("Setting current user in context:", {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        username: userProfile.username,
      });

      // Update authentication state
      setCurrentUser(userProfile);

      console.log("Refreshing auth session...");
      // Force refresh the session to ensure we have the latest auth state
      const refreshResult = await supabase.auth.refreshSession();
      console.log("Session refresh result:", {
        success: !refreshResult.error,
        hasSession: !!refreshResult.data.session,
        errorMessage: refreshResult.error?.message,
      });

      console.log(
        "Registration complete, user is now authenticated and ready for onboarding"
      );
      return;
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      logger.info("Logout initiated", {
        category: "auth",
        data: {
          userId: currentUser?.id,
          username: currentUser?.username,
          action: "logout_attempt",
        },
      });

      // Store user info for logging before clearing state
      const userId = currentUser?.id;

      // Clear current user immediately to update UI
      setCurrentUser(null);

      // First, clear all localStorage items that might contain auth data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes("supabase") || key.includes("auth"))) {
          logger.debug(`Removing localStorage item: ${key}`, {
            category: "auth",
            data: { action: "clear_storage" },
          });
          localStorage.removeItem(key);
        }
      }

      // Sign out from Supabase with global scope to clear all sessions
      const { error } = await supabase.auth.signOut({ scope: "global" });

      if (error) {
        logger.error("Logout failed", {
          category: "auth",
          data: {
            userId,
            errorCode: error.code,
            errorMessage: error.message,
            status: "failed",
          },
        });
        throw error;
      }

      logger.info("Logout successful", {
        category: "auth",
        data: {
          userId,
          status: "success",
        },
      });

      // Make sure loading state is reset
      setLoading(false);

      // Explicitly clear known Supabase auth items
      localStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("supabase.auth.expires_at");
      localStorage.removeItem("supabase.auth.refresh_token");
      localStorage.removeItem("sb-iiynpheftfhvimloydlr-auth-token");

      // Force a hard refresh of the page to completely reset the application state
      // Use location.replace instead of href to prevent the page from being added to history
      logger.info("Forcing page reload after logout", {
        category: "auth",
        data: { action: "page_reload" },
      });

      window.location.replace("/");
    } catch (error) {
      logger.error("Unexpected error during logout", {
        category: "auth",
        data: { error },
      });

      // Even if there's an error, try to force a page reload
      window.location.replace("/");
    }
  };
  // Debug output to help diagnose auth state issues
  useEffect(() => {
    logger.debug("AuthContext current state", {
      category: "auth",
      data: {
        hasCurrentUser: !!currentUser,
        userId: currentUser?.id,
        username: currentUser?.username,
        email: currentUser?.email,
        isAuthenticated: !!currentUser,
        isLoading: loading,
        timestamp: new Date().toISOString(),
      },
    });
  }, [currentUser, loading]);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    loading,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
