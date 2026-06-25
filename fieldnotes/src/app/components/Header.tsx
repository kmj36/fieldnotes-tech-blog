import type { HeaderProps } from "../types";
import { C, FM, FH } from "@/shared/constants";
import type { PageKey } from "@/shared/api";
import { Btn } from "@/shared/components";
import { NotebookPen } from "lucide-react";

export default function Header({ nav, setNav, auth, onLogout }: Readonly<HeaderProps>) {
  return (
    <header style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "58px" }}>
        {/* Logo */}
        <button
          onClick={() => setNav({ page: "home" })}
          aria-label="홈으로 이동"
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "none",
            border: "none",
            padding: 0 
           }}
        >
          <div style={{ width: "34px", height: "34px", background: C.accent, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <NotebookPen size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: FH, fontSize: "1.3rem", fontWeight: "700", color: C.ink, letterSpacing: "-.02em" }}>Fieldnotes</span>
        </button>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {[{ key: "home" as PageKey, label: "Blog" }].map(({ key, label }) => (
            <button
              key={key}
              className="fn-navlink"
              onClick={() => setNav({ page: key })}
              style={{
                cursor: "pointer",
                fontFamily: FM,
                fontSize: ".82rem",
                fontWeight: "600",
                color: nav.page === key ? C.accent : C.muted,
                background: "none",
                border: "none",
                padding: 0
              }}
            >

              {label}
            </button>
          ))}

          {auth.token ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                className="fn-navlink"
                onClick={() => setNav({ page: "admin" })}
                style={{
                  cursor: "pointer",
                  fontFamily: FM,
                  fontSize: ".82rem",
                  fontWeight: "600",
                  color: nav.page.startsWith("admin") ? C.accent : C.muted,
                  background: "none",
                  border: "none",
                  padding: 0
                }}
              >
                Admin
              </button>
              <div style={{ width: "1px", height: "16px", background: C.border }} />
              {auth.user?.avatarUrl && (
                <img src={auth.user.avatarUrl} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <span style={{ fontFamily: FM, fontSize: ".75rem", color: C.muted }}>{auth.user?.nickname || auth.accountId}</span>
              <Btn size="sm" variant="ghost" onClick={onLogout} style={{ padding: "4px 10px" }}>로그아웃</Btn>
            </div>
          ) : import.meta.env.VITE_MODE !== "production" && (
            <Btn size="sm" variant="outline" onClick={() => setNav({ page: "login" })}>Admin 로그인</Btn>
          )}
        </nav>
      </div>
    </header>
  );
}