import { useState } from "react";
import useAsync from "@/shared/hooks/useAsync";
import type { AccountModalState } from "../types";
import AccountForm from "../components/AccountForm";
import { api } from "@/shared/api";
import { C, FH, FB, FM } from "@/shared/constants";
import { Btn, Spinner, Badge } from "@/shared/components";

/* ═══════════════════════════════════════════════════════════════
   ADMIN ACCOUNTS
═══════════════════════════════════════════════════════════════ */
export default function AdminAccounts() {
  const [rev, setRev] = useState<number>(0);
  const [modal, setModal] = useState<AccountModalState | null>(null);

  const { data, loading } = useAsync(() => api.listAccounts({ limit: 100 }), [rev]);
  const accounts = data?.result?.data ?? [];

  async function doDelete(accountId: string): Promise<void> {
    if (!globalThis.confirm(`계정 "${accountId}"를 삭제하시겠습니까?`)) return;
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