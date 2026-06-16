import type { AdminLayoutProps } from "../types";
import type { PageKey } from "@/shared/api";
import { C, FM } from "@/shared/constants";

/* ═══════════════════════════════════════════════════════════════
   ADMIN LAYOUT
═══════════════════════════════════════════════════════════════ */
export default function AdminLayout({ nav, setNav, children }: Readonly<AdminLayoutProps>) {
  const tabs: Array<{ key: PageKey; icon: string; label: string }> = [
    { key: "admin", icon: "📊", label: "대시보드" },
    { key: "admin-posts", icon: "📝", label: "게시물" },
    { key: "admin-categories", icon: "📂", label: "카테고리" },
    { key: "admin-tags", icon: "🏷", label: "태그" },
    { key: "admin-accounts", icon: "👤", label: "계정" },
  ];
  return (
    <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "1.5rem", display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
      <nav style={{ width: "190px", flexShrink: 0, position: "sticky", top: "74px" }}>
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: ".85rem 1rem", borderBottom: `1px solid ${C.border}` }}>
            <p style={{ margin: 0, fontFamily: FM, fontSize: ".65rem", color: C.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: ".08em" }}>Admin Panel</p>
          </div>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setNav({ page: t.key })} style={{
              width: "100%",
              padding: "10px 1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
              fontFamily: FM, fontSize: ".82rem",
              color: nav.page === t.key ? C.accent : C.ink,
              background: nav.page === t.key ? C.accentBg : "transparent",
              border: "none",
              borderLeft: `3px solid ${nav.page === t.key ? C.accent : "transparent"}`,
              transition: "all .15s",
            }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 1rem" }}>
            <button
              onClick={() => setNav({ page: "home" })}
              style={{
                fontFamily: FM,
                fontSize: ".75rem",
                color: C.muted,
                cursor: "pointer",
                background: "none",
                border: "none"
              }}
            >
              → 블로그 보기
            </button>
          </div>
        </div>
      </nav>
      <div style={{ flex: 1, minWidth: 0, animation: "fadeIn .3s ease" }}>{children}</div>
    </div>
  );
}