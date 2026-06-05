import type { CSSProperties } from "react";
import { C, FB } from "../constants/theme";
import Field from "./Field";

const inputBase: CSSProperties = {
    padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: "5px",
    fontFamily: FB, fontSize: ".95rem", color: C.ink, background: "#fff",
    outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color .15s",
};

export interface SelectOption { value: string; label: string; }
interface SelProps { label?: string; value: string; onChange: (v: string) => void; options: SelectOption[]; style?: CSSProperties; }
export function Sel({ label, value, onChange, options, style }: SelProps) {
    return (
        <Field label={label} style={style}>
            <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputBase, cursor: "pointer" }}>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </Field>
    );
}