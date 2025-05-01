import React, { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string | null;
}
interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Check for existing session on load
  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      // Get session from Supabase
      const {
        data: {
          session
        },
        error
      } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
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
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
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
      const {
        data,
        error
      } = await supabase.from('profiles').select('name, username, avatar_url').eq('id', user.id).single();
      if (error) throw error;
      const userProfile: AuthUser = {
        id: user.id,
        email: user.email || '',
        name: data?.name || '',
        username: data?.username || '',
        avatar: data?.avatar_url
      };
      setCurrentUser(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };
  // Sign in with email and password
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      // User profile is fetched by the auth state change listener
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error signing in:', authError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  // Register new user
  const register = async (name: string, username: string, email: string, password: string) => {
    setLoading(true);
    try {
      // 1. Create auth user
      const {
        data: authData,
        error: authError
      } = await supabase.auth.signUp({
        email,
        password
      });
      if (authError) throw authError;
      if (!authData.user) {
        throw new Error('User creation failed');
      }
      // 2. Create profile record
      const {
        error: profileError
      } = await supabase.from('profiles').insert([{
        id: authData.user.id,
        name,
        username,
        email,
        created_at: new Date()
      }]);
      if (profileError) throw profileError;
      // User profile is fetched by the auth state change listener
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  // Sign out
  const logout = async () => {
    try {
      const {
        error
      } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    loading
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}