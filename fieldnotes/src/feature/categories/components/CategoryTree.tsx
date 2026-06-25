import type { CategoryTreeProps, CategoryNode } from "../types";
import { useState } from "react";
import { C, FB } from "@/shared/constants";

interface NodeProps {
    node:       CategoryNode;
    depth?:     number;
    selectedId: number | null;
    onSelect:   (id: number | null) => void;
}

function Node({ node, depth = 0, selectedId, onSelect }: Readonly<NodeProps>) {
    const [open, setOpen] = useState<boolean>(depth < 1);
    const active = selectedId === node.id;

    return (
        <div>
            <div
                className="fn-catitem"
                style={{
                    display: "flex",
                    alignItems: "center",
                    padding: `5px ${8 + depth * 14}px`,
                    borderRadius: "5px",
                    background: active ? C.accentBg : "transparent",
                    color: active ? C.accent : C.ink,
                    cursor: "pointer",
                }}>

                {node.children.length > 0 ? (
                    <button
                        onClick={() => setOpen(v => !v)}
                        style={{
                            background: "none",
                            border: "none",
                            padding: "0 4px 0 0",
                            cursor: "pointer",
                            fontSize: ".65rem",
                            color: "inherit",
                            display: "inline-block",
                            transition: "transform .15s",
                            transform: open ? "rotate(90deg)" : "",
                            flexShrink: 0,
                        }}>
                        ▶
                    </button>
                ) : (
                    <span style={{ fontSize: ".65rem", color: C.faint, padding: "0 4px 0 0" }}>·</span>
                )}

                <button
                    onClick={() => onSelect(node.id)}
                    style={{
                        flex: 1,
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: ".875rem",
                        fontFamily: FB,
                        color: "inherit",
                        userSelect: "none",
                        padding: 0,
                    }}>
                    {node.name}
                </button>

                {node.children.length > 0 && (
                    <span style={{ fontSize: ".65rem", color: C.muted, marginLeft: "4px" }}>
                        {node.children.length}
                    </span>
                )}
            </div>
            {open && node.children.map(c => (
                <Node key={c.id} node={c} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
            ))}
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
            <button
                className="fn-catitem"
                onClick={() => onSelect(null)}
                style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "5px 8px",
                    cursor: "pointer",
                    border: "none",
                    borderRadius: "5px",
                    fontFamily: FB,
                    fontSize: ".875rem",
                    background: selectedId === null ? C.accentBg : "transparent",
                    color: selectedId === null ? C.accent : C.ink,
                }}>
                전체 보기
            </button>
            {roots.map(n => <Node key={n.id} node={n} selectedId={selectedId} onSelect={onSelect} />)}
        </div>
    );
}