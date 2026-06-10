import type { ConfigBarProps } from "../types";
import { useState } from "react";
import { C, FM } from "@/shared/constants";

export default function ConfigBar({ base, onSave }: ConfigBarProps) {
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