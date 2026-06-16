import type { CSSProperties, ReactNode } from "react";
import { C, FM } from "../constants/theme";

type BtnVariant = "primary" | "outline" | "ghost" | "danger" | "success" | "teal";
type BtnSize = "sm" | "md" | "lg";

const variantStyles: Record<BtnVariant, CSSProperties> = {
    primary: { background: C.accent, color: "#fff", border: `1.5px solid ${C.accent}` },
    outline: { background: "transparent", color: C.accent, border: `1.5px solid ${C.accent}` },
    ghost: { background: "transparent", color: C.muted, border: "1.5px solid transparent" },
    danger: { background: C.danger, color: "#fff", border: `1.5px solid ${C.danger}` },
    success: { background: C.success, color: "#fff", border: `1.5px solid ${C.success}` },
    teal: { background: C.teal, color: "#fff", border: `1.5px solid ${C.teal}` },
};
const sizeStyles: Record<BtnSize, CSSProperties> = {
    sm: { padding: "4px 12px", fontSize: ".78rem" },
    md: { padding: "8px 16px", fontSize: ".875rem" },
    lg: { padding: "11px 24px", fontSize: "1rem" },
};

interface BtnProps {
    children: ReactNode; variant?: BtnVariant; size?: BtnSize;
    onClick?: () => void; disabled?: boolean; full?: boolean; style?: CSSProperties;
}
export default function Btn({ children, variant = "primary", size = "md", onClick, disabled, full, style }: Readonly<BtnProps>) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            ...sizeStyles[size], ...variantStyles[variant],
            cursor: disabled ? "not-allowed" : "pointer",
            borderRadius: "5px", fontFamily: FM, fontWeight: "600",
            display: "inline-flex", alignItems: "center", gap: "6px",
            opacity: disabled ? .6 : 1, transition: "all .15s",
            width: full ? "100%" : undefined, justifyContent: full ? "center" : undefined,
            ...style,
        }}>
            {children}
        </button>
    );
}