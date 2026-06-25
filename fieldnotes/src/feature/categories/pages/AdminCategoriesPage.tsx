import { useState } from "react";
import useAsync from "@/shared/hooks/useAsync";
import type { CatModalState } from "../types";
import { api } from "@/shared/api";
import { Btn, Spinner, Modal, Alert } from "@/shared/components";
import { C, FH, FM, FB } from "@/shared/constants";
import CatForm from "../components/CatForm";

/* ═══════════════════════════════════════════════════════════════
   ADMIN CATEGORIES
═══════════════════════════════════════════════════════════════ */

export default function AdminCategories() {
  const [rev, setRev] = useState<number>(0);
  const [modal, setModal] = useState<CatModalState | null>(null);
  const [delId, setDelId] = useState<number | null>(null);
  const [delErr, setDelErr] = useState<string | null>(null);

  const { data, loading } = useAsync(() => api.getCategories({ limit: 200, sortBy: "path", sortDir: "asc" }), [rev]);
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