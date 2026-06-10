import { useState } from "react";
import type { JSX } from "react";
import { Btn} from "@/shared/components";
import { setBase, setToken } from "@/shared/api"
import { C, FH, FB, FM } from "@/shared/constants";
import { AdminAccounts, AdminLayout, AdminDashboard, LoginPage } from "@/feature/auth";
import { AdminTags } from "@/feature/tags";
import type { AuthState, AccountDetail } from "@/feature/auth/types";
import { AdminPosts, HomePage, PostDetailPage, AdminPostEditPage } from "@/feature/post";
import { AdminCategories } from "@/feature/categories";
import type {
  NavState,
  PageKey
} from "@/shared/api";

/* ═══════════════════════════════════════════════════════════════
   GLOBAL STYLES (injected once)
═══════════════════════════════════════════════════════════════ */
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Lora:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; background: ${C.bg}; color: ${C.ink}; font-family: ${FB}; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      .fn-card { transition: box-shadow .2s, transform .2s; }
      .fn-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,.12) !important; transform: translateY(-3px); }
      .fn-navlink { transition: color .15s; }
      .fn-navlink:hover { color: ${C.accent} !important; }
      .fn-catitem { transition: all .15s; }
      .fn-catitem:hover { color: ${C.accent} !important; background: ${C.accentBg} !important; }
      .fn-row:hover { background: ${C.accentBg} !important; }
    `}</style>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SERVER CONFIG BAR
═══════════════════════════════════════════════════════════════ */
interface ConfigBarProps { base: string; onSave: (url: string) => void; }
function ConfigBar({ base, onSave }: ConfigBarProps) {
  const [val, setVal] = useState<string>(base);
  const [open, setOpen] = useState<boolean>(!base);

  const save = (): void => { onSave(val.replace(/\/$/, "")); setOpen(false); };

  if (!open) return (
    <div style={{ background: "#1C1917", color: "#A8A29E", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "5px 1.5rem", fontSize: ".73rem", fontFamily: FM }}>
      <span>🔌 API: <strong style={{ color: "#E8E4DC" }}>{base || "미설정"}</strong></span>
      <button onClick={() => setOpen(true)} style={{ background: "none", border: "1px solid #4B4440", borderRadius: "4px", color: "#A8A29E", padding: "2px 8px", cursor: "pointer", fontFamily: FM, fontSize: ".68rem" }}>변경</button>
      {!base && <span style={{ color: C.accent, fontWeight: "700" }}>← 서버 URL을 먼저 설정하세요</span>}
    </div>
  );

  return (
    <div style={{ background: "#1C1917", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "8px 1.5rem", flexWrap: "wrap" }}>
      <span style={{ fontFamily: FM, fontSize: ".73rem", color: "#A8A29E", whiteSpace: "nowrap" }}>🔌 API Server:</span>
      <input
        value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === "Enter" && save()}
        placeholder="http://localhost:8080"
        style={{ padding: "5px 10px", borderRadius: "4px", border: "1px solid #4B4440", background: "#2D2825", color: "#E8E4DC", fontFamily: FM, fontSize: ".8rem", width: "300px", outline: "none" }}
      />
      <button onClick={save} style={{ padding: "5px 14px", background: C.accent, border: "none", borderRadius: "4px", color: "#fff", fontFamily: FM, fontSize: ".75rem", cursor: "pointer", fontWeight: "700" }}>연결</button>
      {base && <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#A8A29E", fontFamily: FM, fontSize: ".75rem", cursor: "pointer" }}>취소</button>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════════════ */
interface HeaderProps { nav: NavState; setNav: (n: NavState) => void; auth: AuthState; onLogout: () => void; }
function Header({ nav, setNav, auth, onLogout }: HeaderProps) {
  return (
    <header style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "58px" }}>
        {/* Logo */}
        <div onClick={() => setNav({ page: "home" })} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "34px", height: "34px", background: C.accent, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontFamily: FM, fontSize: ".85rem", fontWeight: "700" }}>FN</span>
          </div>
          <span style={{ fontFamily: FH, fontSize: "1.3rem", fontWeight: "700", color: C.ink, letterSpacing: "-.02em" }}>Fieldnotes</span>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {([{ key: "home" as PageKey, label: "Blog" }] as Array<{ key: PageKey; label: string }>).map(({ key, label }) => (
            <span key={key} className="fn-navlink" onClick={() => setNav({ page: key })} style={{ cursor: "pointer", fontFamily: FM, fontSize: ".82rem", fontWeight: "600", color: nav.page === key ? C.accent : C.muted }}>
              {label}
            </span>
          ))}

          {auth.token ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="fn-navlink" onClick={() => setNav({ page: "admin" })} style={{ cursor: "pointer", fontFamily: FM, fontSize: ".82rem", fontWeight: "600", color: nav.page.startsWith("admin") ? C.accent : C.muted }}>
                Admin
              </span>
              <div style={{ width: "1px", height: "16px", background: C.border }} />
              {auth.user?.avatarUrl && (
                <img src={auth.user.avatarUrl} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <span style={{ fontFamily: FM, fontSize: ".75rem", color: C.muted }}>{auth.user?.nickname || auth.accountId}</span>
              <Btn size="sm" variant="ghost" onClick={onLogout} style={{ padding: "4px 10px" }}>로그아웃</Btn>
            </div>
          ) : (
            <Btn size="sm" variant="outline" onClick={() => setNav({ page: "login" })}>Admin 로그인</Btn>
          )}
        </nav>
      </div>
    </header>
  );
}


/* ═══════════════════════════════════════════════════════════════
   APP ROOT  — State-based Router
═══════════════════════════════════════════════════════════════ */
const ADMIN_PAGES: PageKey[] = [
  "admin", "admin-posts", "admin-post-edit",
  "admin-categories", "admin-tags", "admin-accounts",
];

export default function App() {
  const [apiBase, setApiBase] = useState<string>("");
  const [nav, setNav] = useState<NavState>({ page: "home" });
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null, accountId: "" });

  const handleSaveBase = (url: string): void => { setBase(url); setApiBase(url); };

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
      <ConfigBar base={apiBase} onSave={handleSaveBase} />
      <Header nav={nav} setNav={setNav} auth={auth} onLogout={handleLogout} />
      <main style={{ minHeight: "calc(100vh - 120px)" }}>{renderPage()}</main>
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "1.5rem", textAlign: "center", marginTop: "3rem" }}>
        <p style={{ margin: 0, fontFamily: FM, fontSize: ".72rem", color: C.muted }}>
          Fieldnotes Blog · React + TypeScript + OpenAPI v1 · {apiBase ? `🔌 ${apiBase}` : "⚠ API 미연결"}
        </p>
      </footer>
    </div>
  );
}