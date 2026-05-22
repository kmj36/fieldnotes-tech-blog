import { useState, useEffect, useReducer } from "react";
import type { CSSProperties, ReactNode, JSX } from "react";
import { Btn, Badge, Chip, Alert, Spinner, Pager, Input, Field, Modal, Sel } from "@/shared/components";
import type { SelectOption } from "@/shared/components";

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS  — Refined Editorial · Ink on Cream
═══════════════════════════════════════════════════════════════ */
const C = {
  bg: "#F5F0E8",
  surface: "#FFFFFF",
  sidebar: "#FAF7F2",
  ink: "#1C1917",
  muted: "#78716C",
  faint: "#D6D3D1",
  accent: "#C2410C",
  accentBg: "#FFF7F5",
  accentHover: "#9A3412",
  teal: "#0F766E",
  border: "#E7E5E4",
  success: "#15803D",
  danger: "#B91C1C",
  warning: "#B45309",
  codeInk: "#1E293B",
  codeBg: "#0F172A",
};
const FH = "'Playfair Display', Georgia, serif";
const FB = "'Lora', Georgia, serif";
const FM = "'JetBrains Mono', 'Courier New', monospace";


/* ═══════════════════════════════════════════════════════════════
   DOMAIN TYPES  (derived from OpenAPI spec + DB schema)
═══════════════════════════════════════════════════════════════ */
type AccountRole = "USER" | "ADMIN";
type AccountStatus = "ACTIVE" | "SUSPENDED";
type SortDir = "asc" | "desc";

// ── OpenAPI schema shapes ──────────────────────────────────────
interface TagPublic { id: number; name: string; slug: string; }
interface TagDetail extends TagPublic { createdAt: string; updatedAt: string; }

interface CategoryPublic {
  id: number; parentId: number | null;
  name: string; slug: string; path: string;
}
interface CategoryDetail extends CategoryPublic { createdAt: string; updatedAt: string; }
interface CategoryNode extends CategoryPublic { children: CategoryNode[]; }

interface PostPublic {
  id: number; nickname: string; accountId?: string; slug: string;
  title: string; excerpt: string; thumbnail: string | null;
  isPrivate: boolean; createdAt: string; updatedAt: string;
  publishedAt: string | null; category: CategoryPublic | null; tags: TagPublic[];
}
interface PostDetail extends PostPublic { content: string; }

interface AccountPublic {
  id: number; accountId: string; nickname: string;
  avatarUrl: string | null; role: AccountRole; status: AccountStatus;
}
interface AccountDetail extends AccountPublic { createdAt: string; updatedAt: string; }

// ── API wrappers ───────────────────────────────────────────────
interface Pagination {
  page: number; pageLimit: number; total: number; totalPages: number;
  hasNextPage: boolean; hasPrevPage: boolean;
}
interface ApiResponse<T = unknown> {
  status: number; code: string; detail: string; message: string;
  timestamp: string; path: string; result?: T;
}
interface PostListResult { meta: { pagination: Pagination }; data: PostPublic[]; }
interface CategoryListResult { meta: { limit: number }; data: CategoryPublic[]; }
interface TagListResult { meta: { limit: number }; data: TagPublic[]; }
interface AccountListResult { meta: object; data: AccountPublic[]; }
interface LoginResult { AccountID: string; token: string; }

// ── Router / Auth ──────────────────────────────────────────────
type PageKey =
  | "home" | "post" | "login"
  | "admin" | "admin-posts" | "admin-post-edit"
  | "admin-categories" | "admin-tags" | "admin-accounts";

interface NavState { page: PageKey; slug?: string; postSlug?: string; }
interface AuthState { token: string | null; user: AccountDetail | null; accountId: string; }

// ── API param shapes ───────────────────────────────────────────
interface PostQueryParams {
  page?: number; pageLimit?: number; sortBy?: string; sortDir?: SortDir;
  id?: number; nickname?: string; matchType?: string; slug?: string; title?: string;
  categoryId?: number; tagSlugs?: string; dateFilter?: string; dateTarget?: string;
  dateFrom?: string; dateTo?: string; isPrivate?: boolean;
}
interface CategoryQueryParams {
  limit?: number; sortBy?: string; sortDir?: SortDir;
  id?: number; parentId?: number; name?: string; slug?: string;
}
interface TagQueryParams {
  limit?: number; sortBy?: string; sortDir?: SortDir; id?: number; name?: string; slug?: string;
}
interface AccountQueryParams {
  limit?: number; sortBy?: string; sortDir?: SortDir; id?: number;
  accountId?: string; nickname?: string; role?: AccountRole; status?: AccountStatus;
}
interface PostBody {
  slug: string; title: string; content: string;
  thumbnail?: string | null; categoryId?: number | null; tagSlugs?: string[]; isPrivate?: boolean;
}
interface CategoryBody { name: string; slug: string; parentId?: number | null; }
interface TagBody { name: string; slug: string; }
interface AccountRegisterBody {
  accountId: string; password: string; nickname: string;
  avatarUrl?: string; role: AccountRole; status: AccountStatus;
}
interface AccountUpdateBody {
  password?: string; nickname?: string; avatarUrl?: string | null;
  role?: AccountRole; status?: AccountStatus;
}
type QSParams = Record<string, string | number | boolean | undefined | null>;

/* ═══════════════════════════════════════════════════════════════
   API CLIENT  (fully typed to OpenAPI spec)
═══════════════════════════════════════════════════════════════ */
let _BASE: string = "";
let _TOKEN: string = "";

const setBase = (u: string): void => { _BASE = u.replace(/\/$/, ""); };
const setToken = (t: string | null): void => { _TOKEN = t ?? ""; };

async function req<T = unknown>(
  path: string,
  opts: Omit<RequestInit, "body"> & { body?: unknown } = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (_TOKEN) headers["Authorization"] = `Bearer ${_TOKEN}`;
  const { body, ...rest } = opts;
  const res = await fetch(`${_BASE}${path}`, {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string> ?? {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({})) as ApiResponse<T> & { message?: string; detail?: string };
  if (!res.ok) throw new Error(data.message ?? data.detail ?? `HTTP ${res.status}`);
  return data;
}

const buildQS = (p: QSParams = {}): string => {
  const q = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.append(k, String(v));
  });
  return q.toString();
};

const api = {
  /* Posts – Public */
  getPosts: (p?: PostQueryParams) => req<PostListResult>(`/api/v1/post?${buildQS(p as QSParams)}`),
  getPost: (slug: string) => req<PostDetail>(`/api/v1/post/${slug}`),
  /* Posts – Admin */
  getPostsAdmin: (p?: PostQueryParams) => req<PostListResult>(`/api/v1/post/admin?${buildQS(p as QSParams)}`),
  getPostAdmin: (slug: string) => req<PostDetail>(`/api/v1/post/admin/${slug}`),
  createPost: (b: PostBody) => req<PostPublic>("/api/v1/post", { method: "POST", body: b }),
  updatePost: (id: number, b: Partial<PostBody>) => req<PostDetail>(`/api/v1/post/${id}`, { method: "PATCH", body: b }),
  deletePost: (id: number) => req(`/api/v1/post/${id}`, { method: "DELETE" }),
  /* Categories */
  getCategories: (p?: CategoryQueryParams) => req<CategoryListResult>(`/api/v1/category?${buildQS(p as QSParams)}`),
  createCategory: (b: CategoryBody) => req<CategoryDetail>("/api/v1/category", { method: "POST", body: b }),
  updateCategory: (id: number, b: Partial<CategoryBody>) => req<CategoryDetail>(`/api/v1/category/${id}`, { method: "PATCH", body: b }),
  deleteCategory: (id: number) => req(`/api/v1/category/${id}`, { method: "DELETE" }),
  /* Tags */
  getTags: (p?: TagQueryParams) => req<TagListResult>(`/api/v1/tag?${buildQS(p as QSParams)}`),
  createTag: (b: TagBody) => req<TagDetail>("/api/v1/tag", { method: "POST", body: b }),
  updateTag: (id: number, b: Partial<TagBody>) => req<TagDetail>(`/api/v1/tag/${id}`, { method: "PATCH", body: b }),
  deleteTag: (id: number) => req(`/api/v1/tag/${id}`, { method: "DELETE" }),
  /* Auth */
  login: (b: { accountId: string; password: string }) => req<LoginResult>("/api/v1/auth/login", { method: "POST", body: b }),
  register: (b: AccountRegisterBody) => req<AccountDetail>("/api/v1/auth/register", { method: "POST", body: b }),
  getAccount: (aid: string) => req<AccountDetail>(`/api/v1/auth/${aid}`),
  listAccounts: (p?: AccountQueryParams) => req<AccountListResult>(`/api/v1/auth/list?${buildQS(p as QSParams)}`),
  updateAccount: (aid: string, b: AccountUpdateBody) => req<AccountDetail>(`/api/v1/auth/update/${aid}`, { method: "PATCH", body: b }),
  deleteAccount: (aid: string) => req(`/api/v1/auth/delete/${aid}`, { method: "DELETE" }),
};

/* ═══════════════════════════════════════════════════════════════
   INLINE MARKDOWN RENDERER
═══════════════════════════════════════════════════════════════ */
function renderMd(text: string): string {
  if (!text) return "";
  let s = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Fenced code
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, _lang, code) =>
      `<pre style="background:${C.codeBg};color:#E2E8F0;padding:1.25rem;border-radius:8px;overflow-x:auto;font-family:${FM};font-size:.85rem;margin:1.25rem 0;line-height:1.6"><code>${code.trim()}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, `<code style="background:#F1F5F9;color:${C.codeInk};padding:2px 6px;border-radius:4px;font-family:${FM};font-size:.9em">$1</code>`)
    // HR
    .replace(/^---$/gm, `<hr style="border:none;border-top:2px solid ${C.border};margin:2rem 0"/>`)
    // Headings
    .replace(/^### (.+)$/gm, `<h3 style="font-family:${FH};font-size:1.35rem;color:${C.ink};margin:1.75rem 0 .6rem">${'$1'}</h3>`)
    .replace(/^## (.+)$/gm, `<h2 style="font-family:${FH};font-size:1.75rem;color:${C.ink};margin:2rem 0 .75rem">${'$1'}</h2>`)
    .replace(/^# (.+)$/gm, `<h1 style="font-family:${FH};font-size:2.2rem;color:${C.ink};margin:2rem 0 1rem">${'$1'}</h1>`)
    // Bold / Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Blockquote
    .replace(/^&gt; (.+)$/gm, `<blockquote style="border-left:3px solid ${C.accent};padding:.5rem 1rem;margin:1rem 0;color:${C.muted};font-style:italic">$1</blockquote>`)
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, `<a href="$2" target="_blank" style="color:${C.accent};text-decoration:underline">$1</a>`);

  // List items
  s = s.replace(/^[-*] (.+)$/gm, "<li>$1</li>");
  s = s.replace(/(<li>[\s\S]*?<\/li>)/g, `<ul style="list-style:disc;padding-left:1.5rem;margin:.75rem 0">$1</ul>`);

  // Paragraphs (skip block-level tags)
  s = s.split(/\n\n+/).map(block => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (/^<(h[1-6]|ul|ol|pre|blockquote|hr)/.test(trimmed)) return trimmed;
    return `<p style="margin:.75rem 0;line-height:1.8;color:${C.ink}">${trimmed.replace(/\n/g, "<br/>")}</p>`;
  }).join("\n");

  return s;
}

/* ═══════════════════════════════════════════════════════════════
   UTILITY HOOK
═══════════════════════════════════════════════════════════════ */
interface AsyncState<T> { data: T | null; loading: boolean; error: string | null; }

// useReducer 패턴: dispatch는 set-state-in-effect 규칙 적용 대상이 아님
type AsyncAction<T> =
  | { type: "LOADING" }
  | { type: "SUCCESS"; payload: T }
  | { type: "ERROR"; error: string };

function asyncReducer<T>(
  _state: AsyncState<T>,
  action: AsyncAction<T>
): AsyncState<T> {
  switch (action.type) {
    case "LOADING": return { data: null, loading: true, error: null };
    case "SUCCESS": return { data: action.payload, loading: false, error: null };
    case "ERROR": return { data: null, loading: false, error: action.error };
  }
}

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, dispatch] = useReducer(
    asyncReducer as (s: AsyncState<T>, a: AsyncAction<T>) => AsyncState<T>,
    { data: null, loading: true, error: null }
  );

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "LOADING" });
    fn()
      .then(payload => { if (!cancelled) dispatch({ type: "SUCCESS", payload }); })
      .catch((e: unknown) => {
        if (!cancelled) dispatch({ type: "ERROR", error: (e as Error).message });
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

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
   CATEGORY TREE
═══════════════════════════════════════════════════════════════ */
interface CategoryTreeProps { cats: CategoryPublic[]; selectedId: number | null; onSelect: (id: number | null) => void; }
function CategoryTree({ cats, selectedId, onSelect }: CategoryTreeProps) {
  const byId: Record<number, CategoryNode> = {};
  const roots: CategoryNode[] = [];
  cats.forEach(c => (byId[c.id] = { ...c, children: [] }));
  Object.values(byId).forEach(c => {
    if (c.parentId !== null && byId[c.parentId]) byId[c.parentId].children.push(c);
    else roots.push(c);
  });

  function Node({ node, depth = 0 }: { node: CategoryNode; depth?: number }) {
    const [open, setOpen] = useState<boolean>(depth < 1);
    const active = selectedId === node.id;
    return (
      <div>
        <div className="fn-catitem" onClick={() => { onSelect(active ? null : node.id); if (node.children.length) setOpen(v => !v); }}
          style={{ display: "flex", alignItems: "center", gap: "4px", padding: `5px ${8 + depth * 14}px`, cursor: "pointer", borderRadius: "5px", background: active ? C.accentBg : "transparent", color: active ? C.accent : C.ink, fontSize: ".875rem", fontFamily: FB, userSelect: "none" }}>
          {node.children.length > 0
            ? <span style={{ fontSize: ".65rem", color: C.muted, display: "inline-block", transition: "transform .15s", transform: open ? "rotate(90deg)" : "" }}>▶</span>
            : <span style={{ fontSize: ".65rem", color: C.faint }}>·</span>}
          {node.name}
          {node.children.length > 0 && <span style={{ fontSize: ".65rem", color: C.muted, marginLeft: "auto" }}>{node.children.length}</span>}
        </div>
        {open && node.children.map(c => <Node key={c.id} node={c} depth={depth + 1} />)}
      </div>
    );
  }

  return (
    <div>
      <div className="fn-catitem" onClick={() => onSelect(null)}
        style={{ padding: "5px 8px", cursor: "pointer", borderRadius: "5px", fontFamily: FB, fontSize: ".875rem", background: !selectedId ? C.accentBg : "transparent", color: !selectedId ? C.accent : C.ink }}>
        전체 보기
      </div>
      {roots.map(n => <Node key={n.id} node={n} />)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   POST CARD
═══════════════════════════════════════════════════════════════ */
interface PostCardProps { post: PostPublic; onClick: (slug: string) => void; }
function PostCard({ post, onClick }: PostCardProps) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" })
    : "미발행";
  const excerpt = (post.excerpt || "")
    .replace(/#+\s*/g, "").replace(/```[\s\S]*?```/g, "").replace(/`[^`]+`/g, "").trim();

  return (
    <article className="fn-card" onClick={() => onClick(post.slug)} style={{
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

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════ */
function HomePage({ setNav }: { setNav: (n: NavState) => void }) {
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
    <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "2rem 1.5rem", display: "flex", gap: "2rem", alignItems: "flex-start" }}>
      {/* ── Sidebar ── */}
      <aside style={{ width: "220px", flexShrink: 0, position: "sticky", top: "74px" }}>
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
            <button onClick={handleSearch} style={{ padding: "7px 10px", background: C.accent, border: "none", borderRadius: "5px", color: "#fff", cursor: "pointer", fontSize: ".9rem" }}>⌕</button>
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

      {/* ── Main ── */}
      <main style={{ flex: 1, minWidth: 0 }}>
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
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   POST DETAIL PAGE
═══════════════════════════════════════════════════════════════ */
interface PostDetailPageProps { slug: string; setNav: (n: NavState) => void; auth: AuthState; }
function PostDetailPage({ slug, setNav, auth }: PostDetailPageProps) {
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
      <div style={{ marginBottom: "1.5rem" }}>
        <span onClick={() => setNav({ page: "home" })} style={{ fontFamily: FM, fontSize: ".78rem", color: C.muted, cursor: "pointer" }}>← 목록으로</span>
      </div>

      {/* Breadcrumb */}
      {post.category && (
        <div style={{ marginBottom: ".6rem", fontFamily: FM, fontSize: ".7rem", color: C.teal, fontWeight: "700", textTransform: "uppercase", letterSpacing: ".05em" }}>
          {post.category.path.split("/").filter(Boolean).join(" › ")}
        </div>
      )}

      <h1 style={{ margin: "0 0 1rem", fontFamily: FH, fontSize: "2.3rem", fontWeight: "700", color: C.ink, lineHeight: 1.2 }}>
        {post.title}
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem", paddingBottom: "1.75rem", borderBottom: `2px solid ${C.border}`, flexWrap: "wrap" }}>
        <span style={{ fontFamily: FM, fontSize: ".78rem", color: C.muted }}>✒ {post.nickname}</span>
        <span style={{ color: C.faint }}>·</span>
        <span style={{ fontFamily: FM, fontSize: ".78rem", color: C.muted }}>{date}</span>
        {post.isPrivate && <Badge color={C.muted}>Private</Badge>}
        {auth.token && post.id && (
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

      <div dangerouslySetInnerHTML={{ __html: renderMd(post.content ?? "") }} />

      {post.tags?.length > 0 && (
        <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: `1px solid ${C.border}`, display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {post.tags.map(t => <Chip key={t.id} label={`# ${t.name}`} />)}
        </div>
      )}
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════════════════════ */
interface LoginPageProps {
  setNav: (n: NavState) => void;
  onLogin: (data: { token: string; user: AccountDetail | undefined; accountId: string }) => void;
}
function LoginPage({ setNav, onLogin }: LoginPageProps) {
  const [accountId, setAccountId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function doLogin(): Promise<void> {
    if (!accountId || !password) return setError("아이디와 비밀번호를 입력해주세요.");
    setLoading(true); setError(null);
    try {
      const d = await api.login({ accountId, password });
      const token = d.result?.token;
      const aid = d.result?.AccountID ?? "";
      if (!token) throw new Error("토큰을 받지 못했습니다.");
      setToken(token);
      const acc = await api.getAccount(aid);
      onLogin({ token, user: acc.result, accountId: aid });
      setNav({ page: "admin" });
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "65vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "10px", padding: "2.5rem", width: "100%", maxWidth: "400px", boxShadow: "0 8px 32px rgba(0,0,0,.1)", animation: "fadeIn .4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "50px", height: "50px", background: C.accent, borderRadius: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
            <span style={{ color: "#fff", fontFamily: FM, fontSize: "1.1rem", fontWeight: "700" }}>FN</span>
          </div>
          <h2 style={{ margin: 0, fontFamily: FH, fontSize: "1.5rem", color: C.ink }}>관리자 로그인</h2>
          <p style={{ margin: "6px 0 0", fontFamily: FM, fontSize: ".78rem", color: C.muted }}>Fieldnotes Admin Panel</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {error && <Alert msg={error} onClose={() => setError(null)} />}
          <Input label="계정 ID" value={accountId} onChange={setAccountId} placeholder="accountId" />
          <Input label="비밀번호" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          <Btn full disabled={loading} onClick={doLogin}>{loading ? "로그인 중…" : "로그인"}</Btn>
          <Btn full variant="ghost" onClick={() => setNav({ page: "home" })}>← 블로그로 돌아가기</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN LAYOUT
═══════════════════════════════════════════════════════════════ */
interface AdminLayoutProps { nav: NavState; setNav: (n: NavState) => void; children: ReactNode; }
function AdminLayout({ nav, setNav, children }: AdminLayoutProps) {
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
            <div key={t.key} onClick={() => setNav({ page: t.key })} style={{
              padding: "10px 1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
              fontFamily: FM, fontSize: ".82rem",
              color: nav.page === t.key ? C.accent : C.ink,
              background: nav.page === t.key ? C.accentBg : "transparent",
              borderLeft: `3px solid ${nav.page === t.key ? C.accent : "transparent"}`,
              transition: "all .15s",
            }}>
              <span>{t.icon}</span> {t.label}
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 1rem" }}>
            <span onClick={() => setNav({ page: "home" })} style={{ fontFamily: FM, fontSize: ".75rem", color: C.muted, cursor: "pointer" }}>→ 블로그 보기</span>
          </div>
        </div>
      </nav>
      <div style={{ flex: 1, minWidth: 0, animation: "fadeIn .3s ease" }}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════════════ */
interface AdminDashboardProps { auth: AuthState; setNav: (n: NavState) => void; }
function AdminDashboard({ setNav }: AdminDashboardProps) {
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

function RecentTable({ setNav }: { setNav: (n: NavState) => void }) {
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

/* ═══════════════════════════════════════════════════════════════
   ADMIN POSTS
═══════════════════════════════════════════════════════════════ */
function AdminPosts({ setNav }: { setNav: (n: NavState) => void }) {
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

/* ─── Post Form (create / edit modal) ──────────────────────── */
interface PostFormState {
  slug: string; title: string; content: string; thumbnail: string;
  categoryId: string; tagSlugs: string[]; isPrivate: boolean;
}
interface PostFormProps {
  post?: PostDetail; cats: CategoryPublic[]; tags: TagPublic[];
  onClose: () => void; onSave: () => void;
}
function PostForm({ post, cats, tags, onClose, onSave }: PostFormProps) {
  const isEdit = !!post;
  const [f, setF] = useState<PostFormState>({
    slug: post?.slug ?? "",
    title: post?.title ?? "",
    content: post?.content ?? "",
    thumbnail: post?.thumbnail ?? "",
    categoryId: post?.category?.id?.toString() ?? "",
    tagSlugs: post?.tags?.map((t: TagPublic) => t.slug) ?? [],
    isPrivate: post?.isPrivate ?? false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const catOpts: SelectOption[] = [
    { value: "", label: "카테고리 없음" },
    ...cats.slice().sort((a: CategoryPublic, b: CategoryPublic) => a.path.localeCompare(b.path)).map((c: CategoryPublic) => ({
      value: c.id.toString(),
      label: `${"  ".repeat(c.path.split("/").length - 2)}${c.name}  (${c.path})`,
    })),
  ];

  const up = <K extends keyof PostFormState>(k: K) => (v: PostFormState[K]) =>
    setF((p: PostFormState) => ({ ...p, [k]: v }));
  const toggleTag = (slug: string) => setF((p: PostFormState) => ({
    ...p,
    tagSlugs: p.tagSlugs.includes(slug) ? p.tagSlugs.filter((s: string) => s !== slug) : [...p.tagSlugs, slug],
  }));

  async function save(): Promise<void> {
    if (!f.title || !f.slug || !f.content) return setErr("슬러그, 제목, 내용은 필수입니다.");
    setLoading(true); setErr(null);
    try {
      const body: PostBody = {
        slug: f.slug, title: f.title, content: f.content,
        thumbnail: f.thumbnail || null, categoryId: f.categoryId ? parseInt(f.categoryId) : null,
        tagSlugs: f.tagSlugs, isPrivate: f.isPrivate
      };
      if (isEdit && post) await api.updatePost(post.id, body);
      else await api.createPost(body);
      onSave();
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={isEdit ? "게시물 수정" : "새 게시물 작성"} onClose={onClose} width="720px">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {err && <Alert msg={err} onClose={() => setErr(null)} />}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Input label="제목 *" value={f.title} onChange={up("title")} placeholder="게시물 제목" />
          <Input label="슬러그 *" value={f.slug} onChange={up("slug")} placeholder="my-post-slug" />
        </div>
        <Input label="썸네일 URL" value={f.thumbnail} onChange={up("thumbnail")} placeholder="https://…" />
        <Input label="내용 * (Markdown 지원)" value={f.content} onChange={up("content")} rows={12} placeholder={"## 제목\n내용을 작성하세요…"} />
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
          <Sel label="카테고리" value={f.categoryId} onChange={up("categoryId")} options={catOpts} />
          <Field label="공개 여부">
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontFamily: FB, fontSize: ".9rem", padding: "9px 0" }}>
              <input type="checkbox" checked={f.isPrivate} onChange={e => up("isPrivate")(e.target.checked)} />
              비공개 설정
            </label>
          </Field>
        </div>
        <Field label="태그 선택">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "4px 0" }}>
            {tags.map((t: TagPublic) => <Chip key={t.id} label={t.name} active={f.tagSlugs.includes(t.slug)} onClick={() => toggleTag(t.slug)} />)}
          </div>
        </Field>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", paddingTop: "8px", borderTop: `1px solid ${C.border}` }}>
          <Btn variant="ghost" onClick={onClose}>취소</Btn>
          <Btn disabled={loading} onClick={save}>{loading ? "저장 중…" : isEdit ? "수정 저장" : "게시물 생성"}</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Admin Post Edit Page ────────────────────────────────── */
interface AdminPostEditPageProps { postSlug: string; setNav: (n: NavState) => void; }
function AdminPostEditPage({ postSlug, setNav }: AdminPostEditPageProps) {
  const { data, loading, error } = useAsync(() => api.getPostAdmin(postSlug), [postSlug]);
  const { data: catRes } = useAsync(() => api.getCategories({ limit: 200 }), []);
  const { data: tagRes } = useAsync(() => api.getTags({ limit: 100 }), []);
  const [saved, setSaved] = useState<boolean>(false);

  if (loading) return <Spinner />;
  if (error) return <Alert msg={error} />;
  const post = data?.result;
  if (!post) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <Btn variant="ghost" size="sm" onClick={() => setNav({ page: "admin-posts" })}>← 목록</Btn>
        <h2 style={{ margin: 0, fontFamily: FH, fontSize: "1.5rem", color: C.ink }}>게시물 수정</h2>
      </div>
      {post && !saved && (
        <PostForm
          post={post}
          cats={catRes?.result?.data || []}
          tags={tagRes?.result?.data || []}
          onClose={() => setNav({ page: "admin-posts" })}
          onSave={() => { setSaved(true); setTimeout(() => setNav({ page: "admin-posts" }), 800); }}
        />
      )}
      {saved && <Alert type="success" msg="게시물이 성공적으로 수정되었습니다. 목록으로 이동합니다…" />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN CATEGORIES
═══════════════════════════════════════════════════════════════ */
interface CatModalState { mode: "create" | "edit"; item?: CategoryPublic; }
function AdminCategories() {
  const [rev, setRev] = useState<number>(0);
  const [modal, setModal] = useState<CatModalState | null>(null);
  const [delId, setDelId] = useState<number | null>(null);
  const [delErr, setDelErr] = useState<string | null>(null);

  const { data, loading } = useAsync(() => api.getCategories({ limit: 200, sortBy: "id", sortDir: "asc" }), [rev]);
  const cats = data?.result?.data ?? [];

  async function doDelete(id: number): Promise<void> {
    try { await api.deleteCategory(id); setDelId(null); setRev(v => v + 1); }
    catch (e) { setDelErr((e as Error).message); }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, fontFamily: FH, fontSize: "1.75rem", color: C.ink }}>카테고리 관리</h2>
        <Btn onClick={() => setModal({ mode: "create" })}>+ 새 카테고리</Btn>
      </div>
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
        {loading ? <Spinner /> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {["#", "이름", "슬러그", "경로", ""].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontFamily: FM, fontSize: ".67rem", color: C.muted, fontWeight: "700", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cats.map(c => {
                const depth = c.path.split("/").length - 2;
                return (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "9px 12px", fontFamily: FM, fontSize: ".72rem", color: C.faint }}>#{c.id}</td>
                    <td style={{ padding: "9px 12px", fontFamily: FB, fontSize: ".9rem" }}>
                      <span style={{ paddingLeft: `${depth * 14}px` }}>{"└ ".repeat(Math.min(depth, 1))}{c.name}</span>
                    </td>
                    <td style={{ padding: "9px 12px", fontFamily: FM, fontSize: ".78rem", color: C.muted }}>{c.slug}</td>
                    <td style={{ padding: "9px 12px", fontFamily: FM, fontSize: ".75rem", color: C.teal }}>{c.path}</td>
                    <td style={{ padding: "9px 12px" }}>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <Btn size="sm" variant="outline" onClick={() => setModal({ mode: "edit", item: c })}>수정</Btn>
                        <Btn size="sm" variant="danger" onClick={() => { setDelId(c.id); setDelErr(null); }}>삭제</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <CatForm item={modal.item} cats={cats}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); setRev(v => v + 1); }} />
      )}
      {delId !== null && (
        <Modal title="카테고리 삭제" onClose={() => setDelId(null)}>
          <p style={{ fontFamily: FB }}>카테고리 <strong>#{delId}</strong>를 삭제하시겠습니까?<br /><small style={{ color: C.muted }}>하위 카테고리가 있으면 삭제되지 않을 수 있습니다.</small></p>
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

interface CatFormProps { item?: CategoryPublic; cats: CategoryPublic[]; onClose: () => void; onSave: () => void; }
function CatForm({ item, cats, onClose, onSave }: CatFormProps) {
  const isEdit = !!item;
  const [name, setName] = useState<string>(item?.name ?? "");
  const [slug, setSlug] = useState<string>(item?.slug ?? "");
  const [parentId, setParentId] = useState<string>(item?.parentId?.toString() ?? "");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const parentOpts: SelectOption[] = [
    { value: "", label: "최상위 (부모 없음)" },
    ...cats.filter((c: CategoryPublic) => c.id !== item?.id).sort((a: CategoryPublic, b: CategoryPublic) => a.path.localeCompare(b.path)).map((c: CategoryPublic) => ({
      value: c.id.toString(),
      label: `${"—".repeat(c.path.split("/").length - 2)} ${c.name}`,
    })),
  ];

  async function save() {
    if (!name || !slug) return setErr("이름과 슬러그는 필수입니다.");
    setLoading(true); setErr(null);
    try {
      const body = { name, slug, parentId: parentId ? parseInt(parentId) : null };
      if (isEdit) await api.updateCategory(item.id, body);
      else await api.createCategory(body);
      onSave();
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={isEdit ? "카테고리 수정" : "새 카테고리"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {err && <Alert msg={err} onClose={() => setErr(null)} />}
        <Sel label="부모 카테고리" value={parentId} onChange={setParentId} options={parentOpts} />
        <Input label="이름 *" value={name} onChange={setName} placeholder="카테고리 이름" />
        <Input label="슬러그 *" value={slug} onChange={setSlug} placeholder="category-slug" />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>취소</Btn>
          <Btn disabled={loading} onClick={save}>{loading ? "저장 중…" : isEdit ? "수정" : "생성"}</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN TAGS
═══════════════════════════════════════════════════════════════ */
interface TagModalState { item?: TagDetail; }
function AdminTags() {
  const [rev, setRev] = useState<number>(0);
  const [modal, setModal] = useState<TagModalState | null>(null);

  const { data, loading } = useAsync(() => api.getTags({ limit: 200, sortBy: "id", sortDir: "asc" }), [rev]);
  const tags = data?.result?.data || [];

  async function doDelete(id: number): Promise<void> {
    if (!window.confirm("태그를 삭제하시겠습니까?")) return;
    try { await api.deleteTag(id); setRev(v => v + 1); }
    catch (e) { alert((e as Error).message); }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, fontFamily: FH, fontSize: "1.75rem", color: C.ink }}>태그 관리</h2>
        <Btn onClick={() => setModal({})}>+ 새 태그</Btn>
      </div>
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "1.25rem" }}>
        {loading ? <Spinner /> : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {tags.map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "6px", background: C.accentBg, border: `1px solid #FDD8CC`, borderRadius: "6px", padding: "6px 10px" }}>
                <span style={{ fontFamily: FM, fontSize: ".85rem", color: C.accent, fontWeight: "600" }}>{t.name}</span>
                <span style={{ fontFamily: FM, fontSize: ".68rem", color: C.muted }}>/{t.slug}</span>
                <button onClick={() => setModal({ item: t as TagDetail })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: ".8rem", color: C.muted, padding: "0 2px" }}>✏</button>
                <button onClick={() => doDelete(t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: ".8rem", color: C.danger, padding: "0 2px" }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal !== null && (
        <TagForm item={modal.item} onClose={() => setModal(null)} onSave={() => { setModal(null); setRev(v => v + 1); }} />
      )}
    </div>
  );
}

interface TagFormProps { item?: TagDetail; onClose: () => void; onSave: () => void; }
function TagForm({ item, onClose, onSave }: TagFormProps) {
  const isEdit = !!item;
  const [name, setName] = useState<string>(item?.name ?? "");
  const [slug, setSlug] = useState<string>(item?.slug ?? "");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!name || !slug) return setErr("이름과 슬러그는 필수입니다.");
    setLoading(true); setErr(null);
    try {
      if (isEdit) await api.updateTag(item.id, { name, slug });
      else await api.createTag({ name, slug });
      onSave();
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={isEdit ? "태그 수정" : "새 태그"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {err && <Alert msg={err} onClose={() => setErr(null)} />}
        <Input label="태그 이름 *" value={name} onChange={setName} placeholder="태그 이름" />
        <Input label="슬러그 *" value={slug} onChange={setSlug} placeholder="tag-slug" />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>취소</Btn>
          <Btn disabled={loading} onClick={save}>{loading ? "저장 중…" : isEdit ? "수정" : "생성"}</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN ACCOUNTS
═══════════════════════════════════════════════════════════════ */
interface AccountModalState { item?: AccountPublic; }
function AdminAccounts() {
  const [rev, setRev] = useState<number>(0);
  const [modal, setModal] = useState<AccountModalState | null>(null);

  const { data, loading } = useAsync(() => api.listAccounts({ limit: 100 }), [rev]);
  const accounts = data?.result?.data ?? [];

  async function doDelete(accountId: string): Promise<void> {
    if (!window.confirm(`계정 "${accountId}"를 삭제하시겠습니까?`)) return;
    try { await api.deleteAccount(accountId); setRev(v => v + 1); }
    catch (e) { alert((e as Error).message); }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, fontFamily: FH, fontSize: "1.75rem", color: C.ink }}>계정 관리</h2>
        <Btn onClick={() => setModal({})}>+ 새 계정</Btn>
      </div>
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden" }}>
        {loading ? <Spinner /> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {["#", "계정 ID", "닉네임", "역할", "상태", ""].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontFamily: FM, fontSize: ".67rem", color: C.muted, fontWeight: "700", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 12px", fontFamily: FM, fontSize: ".72rem", color: C.faint }}>#{a.id}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {a.avatarUrl && <img src={a.avatarUrl} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                      <span style={{ fontFamily: FM, fontSize: ".85rem", color: C.ink }}>{a.accountId}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", fontFamily: FB, fontSize: ".9rem" }}>{a.nickname}</td>
                  <td style={{ padding: "10px 12px" }}><Badge color={a.role === "ADMIN" ? C.accent : C.teal}>{a.role}</Badge></td>
                  <td style={{ padding: "10px 12px" }}><Badge color={a.status === "ACTIVE" ? C.success : C.danger}>{a.status}</Badge></td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <Btn size="sm" variant="outline" onClick={() => setModal({ item: a })}>수정</Btn>
                      <Btn size="sm" variant="danger" onClick={() => doDelete(a.accountId)}>삭제</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <AccountForm item={modal.item} onClose={() => setModal(null)} onSave={() => { setModal(null); setRev(v => v + 1); }} />
      )}
    </div>
  );
}

interface AccountFormState {
  accountId: string; password: string; nickname: string;
  avatarUrl: string; role: AccountRole; status: AccountStatus;
}
interface AccountFormProps { item?: AccountPublic; onClose: () => void; onSave: () => void; }
function AccountForm({ item, onClose, onSave }: AccountFormProps) {
  const isEdit = !!item;
  const [f, setF] = useState<AccountFormState>({
    accountId: item?.accountId ?? "",
    password: "",
    nickname: item?.nickname ?? "",
    avatarUrl: item?.avatarUrl ?? "",
    role: item?.role ?? "ADMIN",
    status: item?.status ?? "ACTIVE",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const up = <K extends keyof AccountFormState>(k: K) => (v: AccountFormState[K]) =>
    setF((p: AccountFormState) => ({ ...p, [k]: v }));

  async function save(): Promise<void> {
    setLoading(true); setErr(null);
    try {
      if (isEdit && item) {
        const body: AccountUpdateBody = { nickname: f.nickname, avatarUrl: f.avatarUrl || null, role: f.role, status: f.status };
        if (f.password) body.password = f.password;
        await api.updateAccount(item.accountId, body);
      } else {
        if (!f.accountId || !f.password || !f.nickname) throw new Error("필수 항목을 입력해주세요.");
        await api.register({ accountId: f.accountId, password: f.password, nickname: f.nickname, avatarUrl: f.avatarUrl || undefined, role: f.role, status: f.status });
      }
      onSave();
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={isEdit ? "계정 수정" : "새 계정 생성"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {err && <Alert msg={err} onClose={() => setErr(null)} />}
        {!isEdit && <Input label="계정 ID * (3-32자)" value={f.accountId} onChange={up("accountId")} placeholder="accountId" />}
        <Input label={isEdit ? "새 비밀번호 (변경 시에만 입력)" : "비밀번호 * (8자 이상)"} type="password" value={f.password} onChange={up("password")} placeholder="••••••••" />
        <Input label="닉네임 * (2-20자)" value={f.nickname} onChange={up("nickname")} placeholder="닉네임" />
        <Input label="아바타 URL" value={f.avatarUrl} onChange={up("avatarUrl")} placeholder="https://…" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Sel label="역할" value={f.role} onChange={v => up("role")(v as AccountRole)} options={[{ value: "ADMIN", label: "ADMIN" }, { value: "USER", label: "USER" }]} />
          <Sel label="상태" value={f.status} onChange={v => up("status")(v as AccountStatus)} options={[{ value: "ACTIVE", label: "ACTIVE" }, { value: "SUSPENDED", label: "SUSPENDED" }]} />
        </div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>취소</Btn>
          <Btn disabled={loading} onClick={save}>{loading ? "저장 중…" : isEdit ? "수정" : "계정 생성"}</Btn>
        </div>
      </div>
    </Modal>
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