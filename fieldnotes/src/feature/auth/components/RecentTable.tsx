import useAsync from "@/shared/hooks/useAsync";
import { api } from "@/shared/api";
import type { NavState } from "@/shared/api";
import { Spinner } from "@/shared/components";
import { C, FB, FM } from "@/shared/constants";
import { Badge } from "@/shared/components";

export default function RecentTable({ setNav }: { setNav: (n: NavState) => void }) {
  const { data, loading } = useAsync(() => api.getPostsAdmin({ pageLimit: 8, sortBy: "created_at", sortDir: "desc" }), []);
  if (loading) return <Spinner />;
  const posts = data?.result?.data ?? [];
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${C.border}` }}>
          {["제목", "작성자", "카테고리", "공개", "발행일"].map(h => (
            <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontFamily: FM, fontSize: ".67rem", color: C.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {posts.map(p => (
          <tr key={p.id} className="fn-row" onClick={() => setNav({ page: "admin-post-edit", postSlug: p.slug })} style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "background .15s" }}>
            <td style={{ padding: "9px 10px", fontFamily: FB, fontSize: ".9rem", color: C.ink }}>{p.title}</td>
            <td style={{ padding: "9px 10px", fontFamily: FM, fontSize: ".78rem", color: C.muted }}>{p.nickname}</td>
            <td style={{ padding: "9px 10px", fontFamily: FM, fontSize: ".78rem", color: C.teal }}>{p.category?.name ?? "—"}</td>
            <td style={{ padding: "9px 10px" }}><Badge color={p.isPrivate ? C.muted : C.success}>{p.isPrivate ? "비공개" : "공개"}</Badge></td>
            <td style={{ padding: "9px 10px", fontFamily: FM, fontSize: ".75rem", color: C.muted }}>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("ko-KR") : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}