import { createContext } from "react";

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string | null;
  bio?: string;
  created_at?: string;
  stats?: {
    ratings: number;
    reviews: number;
    collections: number;
    lists: number;
    followers: number;
    following: number;
  };
}

export { type AuthContextType, type AuthUser };
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
