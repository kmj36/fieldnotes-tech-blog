import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { C, FH } from "../constants/theme";

interface ModalProps { title: string; children: ReactNode; onClose: () => void; width?: string; }

export default function Modal({ title, children, onClose, width = "520px" }: Readonly<ModalProps>) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        dialog?.showModal();

        const handleBackdropClick = (e: MouseEvent) => {
            if (e.target === dialog) {
                onClose();
            }
        };
        dialog?.addEventListener("click", handleBackdropClick);

        return () => {
            dialog?.removeEventListener("click", handleBackdropClick);
        };
    }, [onClose]);

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            style={{
                border: "none",
                borderRadius: "10px",
                padding: 0,
                width: "100%",
                maxWidth: width,
                maxHeight: "92vh",
                overflow: "auto",
                boxShadow: "0 24px 64px rgba(0,0,0,.35)",
            }}
        >
            <div style={{ padding: "1.1rem 1.5rem", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                <h3 style={{ margin: 0, fontFamily: FH, fontSize: "1.15rem", color: C.ink }}>{title}</h3>
                <button onClick={onClose} aria-label="닫기" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: C.muted, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: "1.5rem" }}>{children}</div>
        </dialog>
    );
}