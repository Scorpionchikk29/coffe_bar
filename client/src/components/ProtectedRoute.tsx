import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowRoles?: string[];
}

export default function ProtectedRoute({ children, allowRoles }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
