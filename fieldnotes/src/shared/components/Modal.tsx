import type { ReactNode } from "react";
import { C, FH } from "../constants/theme";

interface ModalProps { title: string; children: ReactNode; onClose: () => void; width?: string; }
export default function Modal({ title, children, onClose, width = "520px" }: ModalProps) {
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
            onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: "10px", width: "100%", maxWidth: width, maxHeight: "92vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.35)" }}
                onClick={e => e.stopPropagation()}>
                <div style={{ padding: "1.1rem 1.5rem", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                    <h3 style={{ margin: 0, fontFamily: FH, fontSize: "1.15rem", color: C.ink }}>{title}</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: C.muted, lineHeight: 1 }}>×</button>
                </div>
                <div style={{ padding: "1.5rem" }}>{children}</div>
            </div>
        </div>
    );
}