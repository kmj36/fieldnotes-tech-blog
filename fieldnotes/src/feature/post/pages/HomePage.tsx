import { useState } from "react";
import useAsync from "@/shared/hooks/useAsync";
import type { NavState } from "@/shared/api";
import { api } from "@/shared/api";
import type { PostQueryParams } from "../types";
import { C, FB, FM, FH } from "@/shared/constants";
import { Chip, Alert, Spinner, Pager } from "@/shared/components";
import PostCard from "../components/PostCard";
import CategoryTree from "@/feature/categories/components/CategoryTree";

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════ */
export default function HomePage({ setNav }: { setNav: (n: NavState) => void }) {
    const [page, setPage] = useState<number>(1);
    const [catId, setCatId] = useState<number | null>(null);
    const [tagSlug, setTagSlug] = useState<string | null>(null);
    const [titleQ, setTitleQ] = useState<string>("");
    const [titleInput, setTitleInput] = useState<string>("");

    // 필터가 바뀔 때 page를 직접 1로 리셋 — useEffect 없이 이벤트 핸들러에서 처리
    const handleCatSelect = (id: number | null) => { setCatId(id); setPage(1); };
    const handleTagSelect = (slug: string | null) => { setTagSlug(slug); setPage(1); };
    const handleSearch = () => { setTitleQ(titleInput); setPage(1); };
    const handleClearSearch = () => { setTitleQ(""); setTitleInput(""); setPage(1); };

    const params: PostQueryParams = { page, pageLimit: 9, categoryId: catId ?? undefined, tagSlugs: tagSlug ?? undefined, title: titleQ || undefined };
    const { data: postsRes, loading: postsLoading, error: postsErr } = useAsync(() => api.getPosts(params), [page, catId, tagSlug, titleQ]);
    const { data: catRes } = useAsync(() => api.getCategories({ limit: 200, sortBy: "id", sortDir: "asc" }), []);
    const { data: tagRes } = useAsync(() => api.getTags({ limit: 100, sortBy: "id", sortDir: "asc" }), []);

    const posts = postsRes?.result?.data ?? [];
    const meta = postsRes?.result?.meta?.pagination;
    const cats = catRes?.result?.data ?? [];
    const tags = tagRes?.result?.data ?? [];

    return (
        <div style={{ maxWidth: "1500px", margin: "0 auto", padding: "2rem 1.5rem", display: "flex", gap: "2rem", alignItems: "stretch", minHeight: "calc(100vh - 58px - 57px)" }}>
            {/* ── Sidebar ── */}
            <aside style={{ width: "300px", flexShrink: 0, position: "sticky", top: "74px", borderRight: `1px solid ${C.border}`, paddingRight: "1.5rem" }}>
                {/* Search */}
                <div style={{ marginBottom: "1.75rem" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                        <input
                            value={titleInput} onChange={e => setTitleInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSearch()}
                            placeholder="제목 검색…"
                            style={{ flex: 1, padding: "7px 10px", border: `1px solid ${C.border}`, borderRadius: "5px", fontFamily: FB, fontSize: ".875rem", color: C.ink, outline: "none" }}
                            onFocus={e => e.target.style.borderColor = C.accent}
                            onBlur={e => e.target.style.borderColor = C.border}
                        />
                        {/*<button onClick={handleSearch} style={{ padding: "7px 10px", background: C.accent, border: "none", borderRadius: "5px", color: "#fff", cursor: "pointer", fontSize: ".9rem" }}>⌕</button>*/}
                    </div>
                    {titleQ && (
                        <div onClick={handleClearSearch} style={{ marginTop: "6px", fontSize: ".72rem", color: C.accent, cursor: "pointer", fontFamily: FM }}>
                            ✕ &ldquo;{titleQ}&rdquo; 지우기
                        </div>
                    )}
                </div>

                {/* Categories */}
                <div style={{ marginBottom: "1.75rem" }}>
                    <p style={{ margin: "0 0 .6rem", fontFamily: FM, fontSize: ".68rem", color: C.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: ".08em" }}>카테고리</p>
                    <CategoryTree cats={cats} selectedId={catId} onSelect={handleCatSelect} />
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                    <div>
                        <p style={{ margin: "0 0 .6rem", fontFamily: FM, fontSize: ".68rem", color: C.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: ".08em" }}>태그</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                            {tags.map(t => (
                                <Chip key={t.id} label={t.name} active={tagSlug === t.slug}
                                    onClick={() => handleTagSelect(tagSlug === t.slug ? null : t.slug)} />
                            ))}
                        </div>
                    </div>
                )}
            </aside>

            {/* ── Main Div ── */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <h1 style={{ margin: 0, fontFamily: FH, fontSize: "1.8rem", color: C.ink }}>
                        {catId ? (cats.find(c => c.id === catId)?.name ?? "카테고리") : tagSlug ? `#${tagSlug}` : "모든 글"}
                    </h1>
                    {meta && <span style={{ fontFamily: FM, fontSize: ".78rem", color: C.muted }}>{meta.total}편</span>}
                </div>

                {postsErr && (
                    <Alert type="error" msg={`API 오류: ${postsErr} — 상단의 서버 URL 설정을 확인해주세요.`} />
                )}

                {postsLoading ? <Spinner /> : (
                    <>
                        {posts.length === 0
                            ? <div style={{ textAlign: "center", padding: "5rem 1rem", color: C.muted, fontFamily: FB, fontSize: "1.05rem" }}>게시글이 없습니다.</div>
                            : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "1.1rem" }}>
                                {posts.map(p => <PostCard key={p.id} post={p} onClick={slug => setNav({ page: "post", slug })} />)}
                            </div>
                        }
                        <Pager meta={meta} onChange={setPage} />
                    </>
                )}
            </div>
        </div>
    );
}