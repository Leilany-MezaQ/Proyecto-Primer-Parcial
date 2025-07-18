import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: string[]; // ["admin", "editor"]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();

  const userRoles = user?.roles.map(role => role.type) || [];

  const isAllowed = allowedRoles.some(role => userRoles.includes(role));

  return isAllowed ? children : <Navigate to="/unauthorized" replace />;
}
