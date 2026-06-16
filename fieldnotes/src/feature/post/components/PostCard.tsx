import type { PostCardProps } from "../types";
import { C, FM, FH } from "@/shared/constants";
import { Badge, Chip } from "@/shared/components";

/* ═══════════════════════════════════════════════════════════════
   POST CARD
═══════════════════════════════════════════════════════════════ */

export default function PostCard({ post, onClick }: Readonly<PostCardProps>) {
    const date = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" })
        : "미발행";
    const excerpt = (post.excerpt || "")
        .replaceAll(/#+\s*/g, "")
        .replaceAll(/```[\s\S]*?```/g, "")
        .replaceAll(/`[^`]+`/g, "")
        .trim();

    return (
        <article
            className="fn-card"
            role="button"
            aria-label={`게시물 보기: ${post.title}`}
            tabIndex={0}
            onClick={() => onClick(post.slug)}
            onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick(post.slug);
                }
            }}
            style={{
                background: "#fff", borderRadius: "8px", border: `1px solid ${C.border}`,
                cursor: "pointer", display: "flex", flexDirection: "column", overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,.06)", animation: "fadeIn .4s ease both",
        }}>
            {post.thumbnail && (
                <div style={{ height: "172px", background: C.faint, overflow: "hidden" }}>
                    <img src={post.thumbnail} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { ((e.target as HTMLImageElement).parentNode as HTMLElement).style.display = "none"; }} />
                </div>
            )}
            <div style={{ padding: "1.2rem", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    {post.category && <span style={{ fontSize: ".68rem", fontFamily: FM, color: C.teal, fontWeight: "700", textTransform: "uppercase", letterSpacing: ".04em" }}>{post.category.name}</span>}
                    {post.isPrivate && <Badge color={C.muted}>Private</Badge>}
                    <span style={{ fontSize: ".72rem", fontFamily: FM, color: C.muted, marginLeft: "auto" }}>{date}</span>
                </div>
                <h2 style={{ margin: 0, fontFamily: FH, fontSize: "1.1rem", fontWeight: "700", color: C.ink, lineHeight: 1.3 }}>
                    {post.title}
                </h2>
                {excerpt && (
                    <p style={{ margin: 0, fontSize: ".855rem", color: C.muted, lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {excerpt}
                    </p>
                )}
                {post.tags?.length > 0 && (
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "4px" }}>
                        {post.tags.slice(0, 4).map(t => <Chip key={t.id} label={t.name} />)}
                    </div>
                )}
                <div style={{ marginTop: "auto", paddingTop: "10px", borderTop: `1px solid ${C.border}`, fontSize: ".72rem", fontFamily: FM, color: C.muted }}>
                    ✒ {post.nickname}
                </div>
            </div>
        </article>
    );
}