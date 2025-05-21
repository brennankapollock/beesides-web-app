import { createContext } from "react";
import { Models } from 'appwrite';

// Define a type for Appwrite User
export type AppwriteUser = Models.User<Models.Preferences>

// Credentials for sign-up
export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
  phone?: string; // Optional phone number
}

// Credentials for sign-in
export interface SignInCredentials {
  email: string;
  password: string;
  isNewUser?: boolean; // Optional flag to indicate this is coming from registration
}

// This is the user object structure used within the app
export interface AuthUser {
  id: string;        // Appwrite user ID ($id)
  email: string;     // User's email
  name?: string;     // User's name
  phone?: string;    // User's phone number
  username?: string; // Can be derived from name if needed
  avatar_url?: string | null; // Will need to be stored in a separate profiles collection
  bio?: string;      // Will need to be stored in a separate profiles collection
  created_at: string; // Appwrite's $createdAt
  updated_at?: string; // From profiles collection
  last_sign_in_at?: string; // Not directly provided by Appwrite
  stats?: {
    ratings: number;
    reviews: number;
    collections: number;
    lists: number;
    followers: number;
    following: number;
  };
}

export interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  isLoading: boolean; // Alias for loading for consistent naming
  isAuthenticated: boolean; // Whether user is currently authenticated
  isSessionInitialized: boolean; // Whether the session has been initialized
  signUp: (credentials: SignUpCredentials) => Promise<AuthUser | null>;
  signIn: (credentials: SignInCredentials) => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  checkAuthStatus: () => Promise<AuthUser | null>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  getProfile: () => Promise<AuthUser | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
