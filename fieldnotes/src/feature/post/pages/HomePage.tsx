import { useEffect, useState } from "react";
import useAsync from "@/shared/hooks/useAsync";
import { api } from "@/shared/api";
import type { PostQueryParams } from "../types";
import { C, FB, FM, FH } from "@/shared/constants";
import { Chip, Alert, Spinner, Pager } from "@/shared/components";
import PostCard from "../components/PostCard";
import CategoryTree from "@/feature/categories/components/CategoryTree";
import type { CategoryPublic } from "@/feature/categories/types";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════
   HELPERS & HOOKS (모바일 상태 체크 추가)
═══════════════════════════════════════════════════════════════ */

function getPageTitle(catId: number | null, tagSlug: string | null, cats: CategoryPublic[]): string {
    if (catId) {
        return cats.find(c => c.id === catId)?.name ?? "카테고리";
    }
    if (tagSlug) {
        return `#${tagSlug}`;
    }
    return "모든 글";
}

function useIsMobile(breakpoint = 768) {
    const [mobile, setMobile] = useState(
        typeof window !== "undefined" && window.innerWidth < breakpoint
    );
    useEffect(() => {
        const onResize = () => setMobile(window.innerWidth < breakpoint);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [breakpoint]);
    return mobile;
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR COMPONENT (재렌더링 포커스 튀김 방지 분리)
═══════════════════════════════════════════════════════════════ */

interface SidebarProps {
    isMobile: boolean;
    cats: CategoryPublic[];
    tags: any[];
    catId: number | null;
    tagSlug: string | null;
    titleInput: string;
    titleQ: string;
    setTitleInput: (val: string) => void;
    onCatSelect: (id: number | null) => void;
    onTagSelect: (slug: string | null) => void;
    onSearch: () => void;
    onClearSearch: () => void;
}

function Sidebar({
    isMobile, cats, tags, catId, tagSlug, titleInput, titleQ,
    setTitleInput, onCatSelect, onTagSelect, onSearch, onClearSearch
}: SidebarProps) {
    return (
        /* 💡 데스크톱(!isMobile)일 때만 오른쪽에 1.5rem 패딩을 주어 border와 간격을 벌립니다 */
        <div style={{ 
            width: "100%",
            paddingRight: isMobile ? "0" : "1.5rem",
            boxSizing: "border-box" // 패딩 때문에 전체 너비가 300px을 넘지 않도록 안전장치 추가
        }}>
            {/* Search */}
            <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                    <input
                        value={titleInput}
                        onChange={e => setTitleInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && onSearch()}
                        placeholder="제목 검색…"
                        style={{ flex: 1, minWidth: 0, padding: "7px 10px", border: `1px solid ${C.border}`, borderRadius: "5px", fontFamily: FB, fontSize: ".875rem", color: C.ink, outline: "none" }}
                        onFocus={e => e.target.style.borderColor = C.accent}
                        onBlur={e => e.target.style.borderColor = C.border}
                    />
                </div>
                {titleQ && (
                    <button onClick={onClearSearch}
                        style={{ marginTop: "6px", fontSize: ".72rem", color: C.accent, cursor: "pointer", fontFamily: FM, background: "none", border: "none" }}>
                        ✕ &ldquo;{titleQ}&rdquo; 지우기
                    </button>
                )}
            </div>

            {/* Categories */}
            <div style={{ marginBottom: "1.75rem" }}>
                <p style={{ margin: "0 0 .6rem", fontFamily: FM, fontSize: ".68rem", color: C.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: ".08em" }}>카테고리</p>
                <CategoryTree cats={cats} selectedId={catId} onSelect={onCatSelect} />
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div>
                    <p style={{ margin: "0 0 .6rem", fontFamily: FM, fontSize: ".68rem", color: C.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: ".08em" }}>태그</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {tags.map(t => (
                            <Chip key={t.id} label={t.name} active={tagSlug === t.slug}
                                onClick={() => onTagSelect(tagSlug === t.slug ? null : t.slug)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════ */

export default function HomePage() {
    const navigate = useNavigate();

    const isMobile = useIsMobile();

    const [page, setPage] = useState<number>(1);
    const [sideOpen, setSideOpen] = useState(false); // 모바일 사이드바 상태
    const [catId, setCatId] = useState<number | null>(null);
    const [tagSlug, setTagSlug] = useState<string | null>(null);
    const [titleQ, setTitleQ] = useState<string>("");
    const [titleInput, setTitleInput] = useState<string>("");

    // 원본 로직 유지 + 모바일일 때 사이드바 닫기만 추가
    const handleCatSelect = (id: number | null) => { 
        setCatId(id); 
        setPage(1); 
        if (isMobile) setSideOpen(false); 
    };
    
    const handleTagSelect = (slug: string | null) => { 
        setTagSlug(slug); 
        setPage(1); 
        if (isMobile) setSideOpen(false); 
    };
    
    const handleSearch = () => { 
        setTitleQ(titleInput); 
        setPage(1); 
    };
    
    const handleClearSearch = () => { 
        setTitleQ(""); 
        setTitleInput(""); 
        setPage(1); 
    };

    const params: PostQueryParams = { page, pageLimit: 9, categoryId: catId ?? undefined, tagSlugs: tagSlug ?? undefined, title: titleQ, matchType: "contains" };
    const { data: postsRes, loading: postsLoading, error: postsErr } = useAsync(() => api.getPosts(params), [page, catId, tagSlug, titleQ]);
    const { data: catRes } = useAsync(() => api.getCategories({ limit: 200, sortBy: "id", sortDir: "asc" }), []);
    const { data: tagRes } = useAsync(() => api.getTags({ limit: 100, sortBy: "id", sortDir: "asc" }), []);

    const posts = postsRes?.result?.data ?? [];
    const meta = postsRes?.result?.meta?.pagination;
    const cats = catRes?.result?.data ?? [];
    const tags = tagRes?.result?.data ?? [];

    // 모바일 오버레이 활성화 시 스크롤 잠금
    useEffect(() => {
        if (isMobile && sideOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isMobile, sideOpen]);

    const sidebarProps = {
        isMobile, cats, tags, catId, tagSlug, titleInput, titleQ,
        setTitleInput, onCatSelect: handleCatSelect, onTagSelect: handleTagSelect,
        onSearch: handleSearch, onClearSearch: handleClearSearch
    };

    return (
        <div style={{ maxWidth: "1500px", margin: "0 auto", padding: "2rem 1.5rem", display: "flex", gap: "2rem", alignItems: "flex-start", minHeight: "calc(100vh - 58px - 57px)", position: "relative" }}>
            {/* ── 데스크톱 사이드바 (항상 표시) ── */}
            {!isMobile && (
                <aside style={{
                    width: "300px",
                    flexShrink: 0,
                    position: "sticky",
                    /* 💡 상단 네비바 높이(74px)를 제외한 브라우저 화면 높이만큼만 최대 높이를 지정합니다. */
                    top: "74px",
                    maxHeight: "calc(100vh - 74px - 2rem)", 
                    
                    /* 💡 내용이 이 높이를 넘어가면 부드러운 스크롤바를 생기게 합니다. */
                    overflowY: "auto",
                    overflowX: "hidden",
                    borderRight: `1px solid ${C.border}`,
                }}>
                    <Sidebar {...sidebarProps} />
                </aside>
            )}

            {/* ── 모바일 사이드바 (오버레이) ── */}
            {isMobile && sideOpen && (
                <aside style={{
                    position: "fixed",
                    top: "58px",
                    left: 0, right: 0, bottom: 0,
                    background: "#fff",
                    overflowY: "auto",
                    zIndex: 55,
                    display: "flex",
                    flexDirection: "column",
                }}>
                    {/* 상단 닫기 바 */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1rem 1.5rem",
                        borderBottom: `1px solid ${C.border}`,
                        position: "sticky",
                        top: 0,
                        background: "#fff",
                        zIndex: 1,
                    }}>
                        <span style={{ fontFamily: FM, fontSize: ".8rem", color: C.muted, fontWeight: 700 }}>필터</span>
                        <button
                            onClick={() => setSideOpen(false)}
                            aria-label="닫기"
                            style={{
                                width: "36px", height: "36px",
                                border: `1px solid ${C.border}`, borderRadius: "6px",
                                background: "#fff", cursor: "pointer",
                                fontSize: "1.3rem", color: C.ink, lineHeight: 1,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                            ✕
                        </button>
                    </div>

                    {/* 본문 */}
                    <div style={{ padding: "1.5rem" }}>
                        <Sidebar {...sidebarProps} />
                    </div>
                </aside>
            )}

            {/* ── Main Div ── */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* 모바일 필터 열기 버튼 */}
                {isMobile && (
                    <button
                        onClick={() => setSideOpen(true)}
                        style={{
                            marginBottom: "1rem",
                            padding: "8px 14px",
                            border: `1px solid ${C.border}`,
                            borderRadius: "6px",
                            background: "#fff",
                            cursor: "pointer",
                            fontFamily: FM,
                            fontSize: ".85rem",
                            color: C.ink,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}>
                        ☰ 카테고리 · 태그
                    </button>
                )}

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <h1 style={{ margin: 0, fontFamily: FH, fontSize: "1.8rem", color: C.ink }}>
                        {getPageTitle(catId, tagSlug, cats)}
                    </h1>
                    {meta && <span style={{ fontFamily: FM, fontSize: ".78rem", color: C.muted }}>{meta.total}편</span>}
                </div>

                {postsErr && <Alert type="error" msg={`API 오류: ${postsErr}`} />}

                {postsLoading ? <Spinner /> : (
                    <>
                        {posts.length === 0
                            ? <div style={{ textAlign: "center", padding: "5rem 1rem", color: C.muted, fontFamily: FB, fontSize: "1.05rem" }}>게시글이 없습니다.</div>
                            : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "1.1rem" }}>
                                {posts.map(p => <PostCard key={p.id} post={p} onClick={slug => navigate(`/post/${slug}`)} />)}
                            </div>
                        }
                        <Pager meta={meta} onChange={setPage} />
                    </>
                )}
            </div>
        </div>
    );
}