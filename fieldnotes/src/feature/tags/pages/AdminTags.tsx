/* ═══════════════════════════════════════════════════════════════
   ADMIN TAGS
═══════════════════════════════════════════════════════════════ */
import { useState } from "react";
import useAsync from "@/shared/hooks/useAsync";
import type { TagModalState, TagDetail } from "../types";
import { api } from "@/shared/api";
import { C, FH, FM } from "@/shared/constants";
import TagForm from "../components/TagForm";
import { Btn, Spinner } from "@/shared/components";

export default function AdminTags() {
  const [rev, setRev] = useState<number>(0);
  const [modal, setModal] = useState<TagModalState | null>(null);

  const { data, loading } = useAsync(() => api.getTags({ limit: 200, sortBy: "id", sortDir: "asc" }), [rev]);
  const tags = data?.result?.data || [];

  async function doDelete(id: number): Promise<void> {
    if (!globalThis.confirm("태그를 삭제하시겠습니까?")) return;
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