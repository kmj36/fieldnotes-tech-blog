import { useState } from "react";
import type { LoginPageProps } from "../types";
import { api, setToken } from "@/shared/api";
import { C, FH, FM } from "@/shared/constants";
import { Alert, Input, Btn } from "@/shared/components";
import { NotebookPen } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function LoginPage({ setNav, onLogin }: LoginPageProps) {
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
            <NotebookPen size={24} color="#fff" />
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