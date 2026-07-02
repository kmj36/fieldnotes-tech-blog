import { useEffect, useState, lazy, Suspense } from "react";
import type { JSX } from "react";
import { Header, GlobalStyles } from "./components";
import { setToken } from "@/shared/api"
import { C, FM } from "@/shared/constants";
import LoginPage from "@/feature/auth/pages/LoginPage";
import type { AuthState, AccountDetail } from "@/feature/auth/types";
import HomePage from "@/feature/post/pages/HomePage";
import { Spinner } from "@/shared/components";
import { AdminTags } from "@/feature/tags";
import { AdminCategories } from "@/feature/categories";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import ProtectedRoute from "@/feature/auth/components/ProtectedRoute";

const PostDetailPage = lazy(() => import("@/feature/post/pages/PostDetailPage"));
const AdminLayout = lazy(() => import("@/feature/auth/components/AdminLayout"));
const AdminDashboard = lazy(() => import("@/feature/auth/pages/AdminDashboard"));
const AdminAccounts = lazy(() => import("@/feature/auth/pages/AdminAccounts"));
const AdminPosts = lazy(() => import("@/feature/post/pages/AdminPostsPage"));
const AdminPostEditPage = lazy(() => import("@/feature/post/pages/AdminPostEditPage"));

/* ═══════════════════════════════════════════════════════════════
   APP ROOT  — State-based Router
═══════════════════════════════════════════════════════════════ */

export default function App() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null, accountId: "" });

  useEffect(() => {
    const saved = localStorage.getItem("authState");
    if (saved) {
      try {
        const authState = JSON.parse(saved) as AuthState;
        setAuth(authState);
        setToken(authState.token ?? "");   // api 모듈의 토큰도 복원
      } catch {
        localStorage.removeItem("authState");
      }
    }

    if (globalThis.location.hash === "#login") {
      navigate("/login");
      globalThis.history.replaceState(null, "", globalThis.location.pathname);
    }
  }, []);

  const handleLogin = (data: { token: string; user: AccountDetail | undefined; accountId: string }): void => {
    setToken(data.token);
    const authState: AuthState = {
      token: data.token,
      user: data.user ?? null,
      accountId: data.accountId,
    };
    setAuth(authState);
    localStorage.setItem("authState", JSON.stringify(authState));
  };

  const handleLogout = (): void => {
    setToken(null);
    setAuth({ token: null, user: null, accountId: "" });
    localStorage.removeItem("authState");
    navigate("/");
  };

  function renderPage(): JSX.Element {
    return <Routes>
        {/* 공개 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="/post/:slug"
          element={
            <Suspense fallback={<Spinner />}>
              <PostDetailPage />
            </Suspense>
          }
        />

        {/* 관리자 — ProtectedRoute로 감싸고, AdminLayout이 부모 */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="posts/:postSlug/edit" element={<AdminPostEditPage />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="tags" element={<AdminTags />} />
          <Route path="accounts" element={<AdminAccounts />} />
        </Route>

        {/* 없는 경로 → 홈으로 (또는 404 페이지) */}
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <GlobalStyles />
      <Header auth={auth} onLogout={handleLogout} />
      <main style={{ minHeight: "calc(100vh - 58px - 57px)" }}>
        <Suspense fallback={<Spinner />}>
          {renderPage()}
        </Suspense>
      </main>
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "1.5rem", textAlign: "center" }}>
        <p style={{ margin: 0, fontFamily: FM, fontSize: ".72rem", color: C.muted }}>
          Fieldnotes Blog · Copyright 2026. Kim Minje All rights reserved.
        </p>
      </footer>
    </div>
  );
}