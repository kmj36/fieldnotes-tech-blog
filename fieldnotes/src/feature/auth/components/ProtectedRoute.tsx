// src/feature/auth/components/ProtectedRoute.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getStoredAuth } from "@/shared/api/api";

export default function ProtectedRoute({ children }: Readonly<{children: ReactNode}>) {
  const auth = getStoredAuth();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}