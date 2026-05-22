import type { ReactNode } from "react";
import { C, FM } from "../constants/theme";

interface BadgeProps { children: ReactNode; color?: string; }
export default function Badge({ children, color = C.muted }: BadgeProps) {
    return (
        <span style={{
            display: "inline-block", padding: "2px 8px", borderRadius: "4px",
            fontSize: ".68rem", fontFamily: FM, fontWeight: "700", letterSpacing: ".05em", textTransform: "uppercase",
            background: `${color}22`, color,
        }}>
            {children}
        </span>
    );
}