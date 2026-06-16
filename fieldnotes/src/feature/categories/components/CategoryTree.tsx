import type { CategoryTreeProps, CategoryNode } from "../types";
import { useState } from "react";
import { C, FB } from "@/shared/constants";

/* ═══════════════════════════════════════════════════════════════
   CATEGORY TREE
═══════════════════════════════════════════════════════════════ */

interface NodeProps {
    node:      CategoryNode;
    depth?:     number;
    selectedId: number | null;
    onSelect:   (id: number | null) => void;
}

function Node({ node, depth = 0, selectedId, onSelect }: Readonly<NodeProps>) {
    const [open, setOpen] = useState<boolean>(depth < 1);
    const active = selectedId === node.id;

    const handleSelect = () => {
        onSelect(node.id);
        if (node.children.length) setOpen(v => !v);
    }

    return (
        <div>
            <div
                className="fn-catitem"
                role="button"
                onClick={handleSelect}
                onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelect();
                    }
                }}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: `5px ${8 + depth * 14}px`, cursor: "pointer", borderRadius: "5px", background: active ? C.accentBg : "transparent", color: active ? C.accent : C.ink, fontSize: ".875rem", fontFamily: FB, userSelect: "none" }}>
                {node.children.length > 0
                    ? <span style={{ fontSize: ".65rem", color: C.muted, display: "inline-block", transition: "transform .15s", transform: open ? "rotate(90deg)" : "" }}>▶</span>
                    : <span style={{ fontSize: ".65rem", color: C.faint }}>·</span>}
                {node.name}
                {node.children.length > 0 && <span style={{ fontSize: ".65rem", color: C.muted, marginLeft: "auto" }}>{node.children.length}</span>}
            </div>
            {open && node.children.map(c => <Node key={c.id} node={c} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />)}
        </div>
    );
}

export default function CategoryTree({ cats, selectedId, onSelect }: Readonly<CategoryTreeProps>) {
    const byId: Record<number, CategoryNode> = {};
    const roots: CategoryNode[] = [];
    cats.forEach(c => (byId[c.id] = { ...c, children: [] }));
    Object.values(byId).forEach(c => {
        if (c.parentId !== null && byId[c.parentId]) byId[c.parentId].children.push(c);
        else roots.push(c);
    });

    return (
        <div>
            <div
                className="fn-catitem"
                role="button"
                tabIndex={0}
                onClick={() => onSelect(null)}
                onKeyDown ={e => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(null);
                    }
                }}
                style={{
                    padding: "5px 8px",
                    cursor: "pointer",
                    borderRadius: "5px",
                    fontFamily: FB,
                    fontSize: ".875rem",
                    background: selectedId === null ? C.accentBg : "transparent",
                    color: selectedId === null ? C.accent : C.ink
                }}
            >
                전체 보기
            </div>
            {roots.map(n => <Node key={n.id} node={n} selectedId={selectedId} onSelect={onSelect} />)}
        </div>
    );
}