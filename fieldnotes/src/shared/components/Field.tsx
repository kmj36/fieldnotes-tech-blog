import type { CSSProperties, ReactNode } from "react";
import { C, FM } from "../constants/theme";

interface FieldProps { label?: string; children: ReactNode; style?: CSSProperties; }
export default function Field({ label, children, style }: FieldProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", ...style }}>
            {label && <label style={{ fontFamily: FM, fontSize: ".7rem", color: C.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</label>}
            {children}
        </div>
    );
}