import type { CSSProperties } from "react";
import { C, FM, FB } from "../constants/theme";
import Field from "./Field";

const inputBase: CSSProperties = {
    padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: "5px",
    fontFamily: FB, fontSize: ".95rem", color: C.ink, background: "#fff",
    outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color .15s",
};
interface InputProps {
    label?: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; style?: CSSProperties; rows?: number;
}
export default function Input({ label, value, onChange, type = "text", placeholder, style, rows }: Readonly<InputProps>) {
    const baseStyle: CSSProperties = {
        ...inputBase,
        fontFamily: rows ? FM : FB, fontSize: rows ? ".875rem" : ".95rem",
        lineHeight: rows ? "1.6" : undefined, resize: rows ? "vertical" : undefined,
    };
    const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { (e.target as HTMLElement).style.borderColor = C.accent; };
    const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { (e.target as HTMLElement).style.borderColor = C.border; };
    return (
        <Field label={label} style={style}>
            {rows
                ? <textarea value={value} placeholder={placeholder} rows={rows}
                    onChange={e => onChange(e.target.value)} style={baseStyle} onFocus={focus} onBlur={blur} />
                : <input type={type} value={value} placeholder={placeholder}
                    onChange={e => onChange(e.target.value)} style={baseStyle} onFocus={focus} onBlur={blur} />
            }
        </Field>
    );
}