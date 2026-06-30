// src/feature/auth/components/ProtectedRoute.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { AuthState } from "../types";

interface ProtectedRouteProps {
  auth: AuthState;
  children: ReactNode;
}

export default function ProtectedRoute({ auth, children }: Readonly<ProtectedRouteProps>) {
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}