import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Header, GlobalStyles } from "./components";
import { setToken } from "@/shared/api"
import { C, FM } from "@/shared/constants";
import { AdminAccounts, AdminLayout, AdminDashboard, LoginPage } from "@/feature/auth";
import { AdminTags } from "@/feature/tags";
import type { AuthState, AccountDetail } from "@/feature/auth/types";
import { AdminPosts, HomePage, PostDetailPage, AdminPostEditPage } from "@/feature/post";
import { AdminCategories } from "@/feature/categories";
import type { NavState } from "@/shared/api";
import { ADMIN_PAGES } from "./constants/adminPages";

/* ═══════════════════════════════════════════════════════════════
   APP ROOT  — State-based Router
═══════════════════════════════════════════════════════════════ */

export default function App() {
  //const [apiBase, setApiBase] = useState<string>("");
  const [nav, setNav] = useState<NavState>({ page: "home" });
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null, accountId: "" });

  useEffect(() => {
    if (window.location.hash === "#login") {
      setNav({ page: "login" });
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  //const handleSaveBase = (url: string): void => { setBase(url); setApiBase(url); };

  const handleLogin = (data: { token: string; user: AccountDetail | undefined; accountId: string }): void => {
    setToken(data.token);
    setAuth({ token: data.token, user: data.user ?? null, accountId: data.accountId });
  };

  const handleLogout = (): void => {
    setToken(null);
    setAuth({ token: null, user: null, accountId: "" });
    setNav({ page: "home" });
  };

  function renderPage(): JSX.Element {
    if (ADMIN_PAGES.includes(nav.page) && !auth.token) {
      return <LoginPage setNav={setNav} onLogin={handleLogin} />;
    }
    switch (nav.page) {
      case "post":
        return <PostDetailPage slug={nav.slug ?? ""} setNav={setNav} auth={auth} />;
      case "login":
        return <LoginPage setNav={setNav} onLogin={handleLogin} />;
      case "admin":
        return <AdminLayout nav={nav} setNav={setNav}><AdminDashboard auth={auth} setNav={setNav} /></AdminLayout>;
      case "admin-posts":
        return <AdminLayout nav={nav} setNav={setNav}><AdminPosts setNav={setNav} /></AdminLayout>;
      case "admin-post-edit":
        return <AdminLayout nav={nav} setNav={setNav}><AdminPostEditPage postSlug={nav.postSlug ?? ""} setNav={setNav} /></AdminLayout>;
      case "admin-categories":
        return <AdminLayout nav={nav} setNav={setNav}><AdminCategories /></AdminLayout>;
      case "admin-tags":
        return <AdminLayout nav={nav} setNav={setNav}><AdminTags /></AdminLayout>;
      case "admin-accounts":
        return <AdminLayout nav={nav} setNav={setNav}><AdminAccounts /></AdminLayout>;
      default:
        return <HomePage setNav={setNav} />;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <GlobalStyles />
      {/* <ConfigBar base={apiBase} onSave={handleSaveBase} /> */}
      <Header nav={nav} setNav={setNav} auth={auth} onLogout={handleLogout} />
      <main style={{ minHeight: "calc(100vh - 58px - 57px)" }}>{renderPage()}</main>
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "1.5rem", textAlign: "center" }}>
        <p style={{ margin: 0, fontFamily: FM, fontSize: ".72rem", color: C.muted }}>
          Fieldnotes Blog · Copyright 2026. Kim Minje All rights reserved.
        </p>
      </footer>
    </div>
  );
}