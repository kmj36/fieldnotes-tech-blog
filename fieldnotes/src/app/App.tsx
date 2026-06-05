import { useState } from "react";
import type { ReactNode, JSX } from "react";
import { Btn, Badge, Alert, Spinner, Input, Modal, Sel } from "@/shared/components";
import type { SelectOption } from "@/shared/components";
import { api, setBase, setToken } from "@/shared/api"
import { C, FH, FB, FM } from "@/shared/constants";
import useAsync from "@/shared/hooks/useAsync";
import { AdminPosts, HomePage, PostDetailPage, AdminPostEditPage } from "@/feature/post";
import type {
  NavState,
  AuthState,
  PageKey,
  CategoryPublic,
  AccountDetail,
  TagDetail,
  AccountPublic,
  AccountRole,
  AccountStatus,
  AccountUpdateBody
} from "@/shared/api";

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