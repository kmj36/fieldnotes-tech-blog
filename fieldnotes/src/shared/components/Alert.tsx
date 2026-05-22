import { C, FM } from "../constants/theme";

type AlertType = "error" | "success" | "warning";
interface AlertProps { type?: AlertType; msg: string | null; onClose?: () => void; }
export default function Alert({ type = "error", msg, onClose }: AlertProps) {
    if (!msg) return null;
    const col = ({ error: C.danger, success: C.success, warning: C.warning } as Record<AlertType, string>)[type];
    return (
        <div style={{ padding: "10px 14px", background: `${col}18`, border: `1px solid ${col}44`, borderRadius: "6px", color: col, fontFamily: FM, fontSize: ".85rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
            <span>{msg}</span>
            {onClose && <button onClick={onClose} style={{ background: "none", border: "none", color: col, cursor: "pointer", fontWeight: "700", fontSize: "1.1rem", lineHeight: 1, flexShrink: 0 }}>×</button>}
        </div>
    );
}