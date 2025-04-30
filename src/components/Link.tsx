import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
export function Link({
  to,
  children,
  className = '',
  onClick
}: LinkProps) {
  return <RouterLink to={to} className={`cursor-pointer ${className}`} onClick={onClick}>
      {children}
    </RouterLink>;
}