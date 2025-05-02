import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User, AuthError } from "@supabase/supabase-js";
import { AuthContext, AuthUser } from "./AuthContextTypes";
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Check for existing session on load
  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      // Get session from Supabase
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        setLoading(false);
        return;
      }
      if (session) {
        await fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    };
    fetchSession();
    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await fetchUserProfile(session.user);
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null);
      }
    });
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  // Fetch user profile data from profiles table
  const fetchUserProfile = async (user: User) => {
    try {
      // First try to get from user_stats view
      let data;
      let error;

      try {
        const result = await supabase
          .from("user_stats")
          .select("*")
          .eq("id", user.id)
          .single();

        data = result.data;
        error = result.error;
      } catch (viewError) {
        console.warn(
          "Error fetching from user_stats view, falling back to profiles table:",
          viewError
        );
        // Fall back to profiles table if view has issues
        const result = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) {
        // If still no profile, create one
        if (error.code === "PGRST116") {
          console.log("No profile found, creating one");
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || "",
                username: user.user_metadata?.username || "",
                created_at: new Date(),
              },
            ])
            .select()
            .single();

          if (insertError) throw insertError;
          data = newProfile;
        } else {
          throw error;
        }
      }

      const userProfile: AuthUser = {
        id: user.id,
        email: user.email || "",
        name: data?.name || user.user_metadata?.name || "",
        username: data?.username || user.user_metadata?.username || "",
        avatar: data?.avatar_url,
        bio: data?.bio,
        created_at: data?.created_at,
        stats: {
          ratings: data?.ratings_count || 0,
          reviews: data?.reviews_count || 0,
          collections: data?.collections_count || 0,
          lists: data?.lists_count || 0,
          followers: data?.followers_count || 0,
          following: data?.following_count || 0,
        },
      };

      setCurrentUser(userProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };
  // Sign in with email and password
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // User profile is fetched by the auth state change listener
    } catch (error) {
      const authError = error as AuthError;
      console.error("Error signing in:", authError.message);
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
      console.log("Starting registration process", { name, username, email });

      // 1. Create auth user - simpler approach
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username,
          },
        },
      });

      console.log("Auth signup result:", authData?.user?.id);

      if (authError) throw authError;
      if (!authData.user) {
        throw new Error("User creation failed");
      }

      // Our database trigger will create the profile automatically
      console.log("User created successfully, ID:", authData.user.id);

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

      // Set the user in state
      setCurrentUser(userProfile);
      console.log("Registration complete, user set in context");

      // After setting the user in state, ensure we're fully authenticated by getting the session
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Session after registration:", sessionData);

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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };
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
