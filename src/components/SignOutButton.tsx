import React from 'react';
import { LogOutIcon } from 'lucide-react';
import { logger } from '../utils/logger';
import { useAuth } from '../hooks/useAuth';

interface SignOutButtonProps {
  className?: string;
  onSuccess?: () => void;
}

export function SignOutButton({ className = '', onSuccess }: SignOutButtonProps) {
  const { logout } = useAuth();
  
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    logger.info("Sign out button clicked", {
      category: 'auth',
      data: { action: 'sign_out_attempt', timestamp: new Date().toISOString() }
    });
    
    try {
      // Use the AuthContext's logout function instead of calling Supabase directly
      await logout();
      
      logger.info("Sign out successful", {
        category: 'auth',
        data: { status: 'success' }
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Note: No need to force page reload or redirect here as it's handled in the AuthContext logout function
    } catch (error) {
      logger.error("Error during sign out", {
        category: 'auth',
        data: { error }
      });
    }
  };
  
  return (
    <button
      onClick={handleSignOut}
      className={`flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-xl transition-colors w-full ${className}`}
    >
      <div className="p-2 bg-gray-100 rounded-full">
        <LogOutIcon size={20} />
      </div>
      <span className="text-xs">Sign Out</span>
    </button>
  );
}
