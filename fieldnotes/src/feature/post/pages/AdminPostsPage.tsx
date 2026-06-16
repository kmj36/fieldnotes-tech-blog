import type { NavState } from "@/shared/api";
import { api } from "@/shared/api";
import { useState } from "react";
import useAsync from "@/shared/hooks/useAsync";
import { Btn, Modal, Alert, Spinner, Badge, Pager } from "@/shared/components";
import { C, FB, FH, FM } from "@/shared/constants";
import PostForm from "../components/PostForm";

/* ═══════════════════════════════════════════════════════════════
   ADMIN POSTS
═══════════════════════════════════════════════════════════════ */
export default function AdminPosts({ setNav }: Readonly<{ setNav: (n: NavState) => void }>) {
    const [page, setPage] = useState<number>(1);
    const [rev, setRev] = useState<number>(0);
    const [showCreate, setShowCreate] = useState<boolean>(false);
    const [delId, setDelId] = useState<number | null>(null);
    const [delErr, setDelErr] = useState<string | null>(null);

    const { data, loading, error } = useAsync(() => api.getPostsAdmin({ page, pageLimit: 12, sortBy: "created_at", sortDir: "desc" }), [page, rev]);
    const { data: catRes } = useAsync(() => api.getCategories({ limit: 200, sortBy: "id" }), []);
    const { data: tagRes } = useAsync(() => api.getTags({ limit: 100 }), []);

    const posts = data?.result?.data ?? [];
    const meta = data?.result?.meta?.pagination;

    async function doDelete(id: number): Promise<void> {
        try { await api.deletePost(id); setDelId(null); setRev(v => v + 1); }
        catch (e) { setDelErr((e as Error).message); }
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0, fontFamily: FH, fontSize: "1.75rem", color: C.ink }}>게시물 관리</h2>
                <Btn onClick={() => setShowCreate(true)}>+ 새 게시물</Btn>
            </div>
            {error && <div style={{ marginBottom: "1rem" }}><Alert msg={error} /></div>}
            <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
                {loading ? <Spinner /> : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                                    {["#", "제목", "작성자", "카테고리", "공개", "발행일", ""].map(h => (
                                        <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontFamily: FM, fontSize: ".67rem", color: C.muted, fontWeight: "700", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map(p => (
                                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <td style={{ padding: "10px 12px", fontFamily: FM, fontSize: ".75rem", color: C.faint }}>#{p.id}</td>
                                        <td style={{ padding: "10px 12px", maxWidth: "200px" }}>
                                            <div style={{ fontFamily: FB, fontSize: ".9rem", color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                                            <div style={{ fontFamily: FM, fontSize: ".68rem", color: C.muted }}>{p.slug}</div>
                                        </td>
                                        <td style={{ padding: "10px 12px", fontFamily: FM, fontSize: ".78rem", color: C.muted, whiteSpace: "nowrap" }}>{p.nickname}</td>
                                        <td style={{ padding: "10px 12px", fontFamily: FM, fontSize: ".78rem", color: C.teal, whiteSpace: "nowrap" }}>{p.category?.name ?? "—"}</td>
                                        <td style={{ padding: "10px 12px" }}><Badge color={p.isPrivate ? C.muted : C.success}>{p.isPrivate ? "비공개" : "공개"}</Badge></td>
                                        <td style={{ padding: "10px 12px", fontFamily: FM, fontSize: ".75rem", color: C.muted, whiteSpace: "nowrap" }}>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("ko-KR") : "—"}</td>
                                        <td style={{ padding: "10px 12px" }}>
                                            <div style={{ display: "flex", gap: "5px" }}>
                                                <Btn size="sm" variant="outline" onClick={() => setNav({ page: "admin-post-edit", postSlug: p.slug })}>수정</Btn>
                                                <Btn size="sm" variant="danger" onClick={() => { setDelId(p.id); setDelErr(null); }}>삭제</Btn>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pager meta={meta} onChange={setPage} />
            </div>

            {showCreate && (
                <PostForm
                    cats={catRes?.result?.data || []}
                    tags={tagRes?.result?.data || []}
                    onClose={() => setShowCreate(false)}
                    onSave={() => { setShowCreate(false); setRev(v => v + 1); }}
                />
            )}
            {delId !== null && (
                <Modal title="게시물 삭제 확인" onClose={() => setDelId(null)}>
                    <p style={{ fontFamily: FB, color: C.ink, marginTop: 0 }}>게시물 <strong>#{delId}</strong>을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
                    {delErr && <Alert msg={delErr} onClose={() => setDelErr(null)} />}
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "1rem" }}>
                        <Btn variant="ghost" onClick={() => setDelId(null)}>취소</Btn>
                        <Btn variant="danger" onClick={() => doDelete(delId)}>삭제</Btn>
                    </div>
                </Modal>
            )}
        </div>
    );
}