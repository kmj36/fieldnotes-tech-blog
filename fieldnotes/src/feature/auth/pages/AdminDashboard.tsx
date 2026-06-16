import type { AdminDashboardProps } from "../types";
import useAsync from "@/shared/hooks/useAsync";
import { api } from "@/shared/api";
import { C, FH, FM } from "@/shared/constants";
import { Btn } from "@/shared/components";
import RecentTable from "../components/RecentTable";

/* ═══════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════════════ */
export default function AdminDashboard({ setNav }: Readonly<AdminDashboardProps>) {
  const { data: postsRes } = useAsync(() => api.getPostsAdmin({ pageLimit: 1 }), []);
  const { data: catRes } = useAsync(() => api.getCategories({ limit: 200 }), []);
  const { data: tagRes } = useAsync(() => api.getTags({ limit: 200 }), []);

  const stats = [
    { icon: "📝", label: "전체 게시물", value: postsRes?.result?.meta?.pagination?.total },
    { icon: "📂", label: "카테고리", value: catRes?.result?.data?.length },
    { icon: "🏷", label: "태그", value: tagRes?.result?.data?.length },
  ];

  return (
    <div>
      <h2 style={{ margin: "0 0 1.5rem", fontFamily: FH, fontSize: "1.75rem", color: C.ink }}>대시보드</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: ".4rem" }}>{s.icon}</div>
            <div style={{ fontFamily: FH, fontSize: "2.2rem", fontWeight: "700", color: C.ink }}>{s.value ?? "—"}</div>
            <div style={{ fontFamily: FM, fontSize: ".72rem", color: C.muted, marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontFamily: FH, fontSize: "1.1rem", color: C.ink }}>최근 게시물</h3>
          <Btn size="sm" variant="outline" onClick={() => setNav({ page: "admin-posts" })}>전체 보기</Btn>
        </div>
        <RecentTable setNav={setNav} />
      </div>
    </div>
  );
}