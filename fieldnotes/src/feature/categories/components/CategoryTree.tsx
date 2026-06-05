import type { CategoryTreeProps } from "../types";
import type { CategoryNode } from "@/shared/api";
import { useState } from "react";
import { C, FB } from "@/shared/constants";

/* ═══════════════════════════════════════════════════════════════
   CATEGORY TREE
═══════════════════════════════════════════════════════════════ */
export default function CategoryTree({ cats, selectedId, onSelect }: CategoryTreeProps) {
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