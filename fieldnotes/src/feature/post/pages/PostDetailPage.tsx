import type { PostDetailPageProps } from "../types";
import useAsync from "@/shared/hooks/useAsync";
import { api } from "@/shared/api";
import { Spinner, Alert, Btn, Badge, Chip } from "@/shared/components";
import { C, FM, FH } from "@/shared/constants";
import { MarkdownViewer } from "@/shared/components/MarkdownCodeBlock";

/* ═══════════════════════════════════════════════════════════════
   POST DETAIL PAGE
═══════════════════════════════════════════════════════════════ */
export default function PostDetailPage({ slug, setNav, auth }: Readonly<PostDetailPageProps>) {
    const { data, loading, error } = useAsync(
        () => auth.token ? api.getPostAdmin(slug) : api.getPost(slug),
        [slug, auth.token]
    );
    const post = data?.result;

    if (loading) return <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1.5rem" }}><Spinner /></div>;
    if (error) return (
        <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1.5rem" }}>
            <Alert msg={`오류: ${error}`} /><br />
            <Btn variant="ghost" onClick={() => setNav({ page: "home" })}>← 목록으로</Btn>
        </div>
    );
    if (!post) return null;

    const date: string = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
        : "미발행";

    return (
        <article style={{ maxWidth: "800px", margin: "0 auto", padding: "2.5rem 1.5rem", animation: "fadeIn .4s ease" }}>
            {/* 뒤로가기 */}
            <div style={{ marginBottom: "1.5rem" }}>
                <button
                    onClick={() => setNav({ page: "home" })}
                    style={{
                        fontFamily: FM,
                        fontSize: ".78rem",
                        color: C.muted,
                        cursor: "pointer",
                        background: "none",
                        border: "none"
                        }}
                    >
                        ← 목록으로
                </button>
            </div>

            {/* Breadcrumb */}
            {post.category && (
                <div style={{ marginBottom: ".6rem", fontFamily: FM, fontSize: ".7rem", color: C.teal, fontWeight: "700", textTransform: "uppercase", letterSpacing: ".05em" }}>
                    {post.category.path.split("/").filter(Boolean).join(" › ")}
                </div>
            )}

            {/* 제목 */}
            <h1 style={{ margin: "0 0 1rem", fontFamily: FH, fontSize: "2.3rem", fontWeight: "700", color: C.ink, lineHeight: 1.2 }}>
                {post.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem", paddingBottom: "1.75rem", borderBottom: `2px solid ${C.border}`, flexWrap: "wrap" }}>
                <span style={{ fontFamily: FM, fontSize: ".78rem", color: C.muted }}>✒ {post.nickname}</span>
                <span style={{ color: C.faint }}>·</span>
                <span style={{ fontFamily: FM, fontSize: ".78rem", color: C.muted }}>{date}</span>
                {post.isPrivate && <Badge color={C.muted}>Private</Badge>}
                {Boolean(auth.token) && post.id !== undefined && (
                    <Btn size="sm" variant="outline" style={{ marginLeft: "auto" }}
                        onClick={() => setNav({ page: "admin-post-edit", postSlug: slug })}>
                        ✏ 수정
                    </Btn>
                )}
            </div>

            {post.thumbnail && (
                <img src={post.thumbnail} alt={post.title} style={{ width: "100%", borderRadius: "8px", marginBottom: "1.75rem", maxHeight: "420px", objectFit: "cover" }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}

            <MarkdownViewer source={post.content ?? ("")}/>

            {post.tags?.length > 0 && (
                <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: `1px solid ${C.border}`, display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {post.tags.map(t => <Chip key={t.id} label={`# ${t.name}`} />)}
                </div>
            )}
        </article>
    );
}