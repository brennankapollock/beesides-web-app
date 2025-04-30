import React, { useEffect, useState, createContext, useContext } from 'react';
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string | null;
}
interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Check if user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);
  // Mock login function - in a real app, this would call an API
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // For demo purposes, we'll just check against hardcoded credentials
      if (email === 'johndoe@example.com' && password === 'password123') {
        const user = {
          id: '1',
          name: 'John Doe',
          username: 'johndoe',
          email: 'johndoe@example.com',
          avatar: null
        };
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return;
      }
      throw new Error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };
  // Mock register function - in a real app, this would call an API
  const register = async (name: string, username: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Create a new user
      const user = {
        id: Math.random().toString(36).substring(2, 15),
        name,
        username,
        email,
        avatar: null
      };
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
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