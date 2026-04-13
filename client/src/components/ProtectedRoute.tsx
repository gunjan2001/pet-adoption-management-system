// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../_core/hooks/useAuth.js";

interface ProtectedRouteProps {
  children:      React.ReactNode;
  requiredRole?: "user" | "admin";
}

/**
 * Wraps any route that requires authentication.
 * Optionally restricts to a specific role.
 *
 * Usage:
 *   <ProtectedRoute>          – any logged-in user
 *   <ProtectedRoute requiredRole="admin">  – admin only
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuth, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Still rehydrating from localStorage — render nothing to avoid flash
  if (isLoading) return null;

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === "admin" && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
