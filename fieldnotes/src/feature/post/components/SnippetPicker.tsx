// feature/post-editor/SnippetPicker.tsx
import { useState } from "react";
import { snippetStore } from "@/shared/lib/snippetStorage";
import type { Snippet } from "@/shared/lib/snippetStorage";

interface Props {
  onInsert: (content: string) => void;
}

export function SnippetPicker({ onInsert }: Props) {
  const [open, setOpen] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  const refresh = () => setSnippets(snippetStore.list());

  const handleDelete = (id: string) => {
    if (!confirm("이 스니펫을 삭제하시겠습니까?")) return;
    snippetStore.remove(id);
    refresh();
  };

  const handleRename = (s: Snippet) => {
    const name = prompt("새 이름", s.name);
    if (!name) return;
    snippetStore.update(s.id, { name });
    refresh();
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button type="button" onClick={() => { setOpen((o) => !o); refresh(); }}>
        스니펫 불러오기
      </button>
      {open && (
        <ul style={{
          position: "absolute", top: "100%", left: 0, zIndex: 50,
          background: "#fff", border: "1px solid #ddd", minWidth: 200,
          maxHeight: 260, overflowY: "auto", listStyle: "none", margin: 0, padding: 4,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}>
          {snippets.length === 0 && (
            <li style={{ padding: "6px 8px", color: "#999" }}>저장된 스니펫 없음</li>
          )}
          {snippets.map((s) => (
            <li key={s.id} style={{ display: "flex", alignItems: "center", padding: "4px 6px" }}>
              <button
                type="button"
                onClick={() => { onInsert(s.content); setOpen(false); }}
                style={{ flex: 1, textAlign: "left", border: "none", background: "none", cursor: "pointer" }}
              >
                {s.name}
              </button>
              <button type="button" onClick={() => handleRename(s)} title="이름 변경" style={{ border: "none", background: "none", cursor: "pointer" }}>✎</button>
              <button type="button" onClick={() => handleDelete(s.id)} title="삭제" style={{ border: "none", background: "none", cursor: "pointer" }}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}