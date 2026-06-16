import { C, FM } from "../constants/theme";

interface ChipProps { label: string; active?: boolean; onClick?: () => void; }
export default function Chip({ label, active, onClick }: Readonly<ChipProps>) {
    return (
        <button onClick={onClick} style={{
            display: "inline-flex", alignItems: "center",
            padding: "3px 10px", borderRadius: "100px", fontSize: ".73rem", fontFamily: FM,
            cursor: onClick ? "pointer" : "default", transition: "all .15s", whiteSpace: "nowrap",
            background: active ? C.accent : C.accentBg,
            color: active ? "#fff" : C.accent,
            border: `1px solid ${active ? C.accent : "#FDD8CC"}`,
        }}>
            {label}
        </button>
    );
}