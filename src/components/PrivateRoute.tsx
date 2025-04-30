import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
export function PrivateRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const {
    isAuthenticated,
    loading
  } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}