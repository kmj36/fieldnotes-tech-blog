import { C, FM } from "../constants/theme";
import Btn from "./Btn";

interface Pagination {
    page: number; pageLimit: number; total: number; totalPages: number;
    hasNextPage: boolean; hasPrevPage: boolean;
}
interface PagerProps { meta: Pagination | undefined; onChange: (p: number) => void; }
export default function Pager({ meta, onChange }: PagerProps) {
    if (!meta || meta.totalPages <= 1) return null;
    const { page, totalPages, hasPrevPage, hasNextPage } = meta;
    const pages = [];
    const lo = Math.max(1, page - 2), hi = Math.min(totalPages, page + 2);
    for (let i = lo; i <= hi; i++) pages.push(i);
    return (
        <div style={{ display: "flex", gap: "4px", justifyContent: "center", padding: "1.5rem 0", alignItems: "center" }}>
            <Btn size="sm" variant="ghost" disabled={!hasPrevPage} onClick={() => onChange(page - 1)}>← Prev</Btn>
            {lo > 1 && <><span style={{ fontFamily: FM, fontSize: ".8rem", padding: "4px 8px", cursor: "pointer" }} onClick={() => onChange(1)}>1</span><span style={{ color: C.muted }}>…</span></>}
            {pages.map(p => (
                <button key={p} onClick={() => onChange(p)} style={{
                    width: "32px", height: "32px", border: "none", borderRadius: "5px",
                    background: p === page ? C.accent : "transparent", color: p === page ? "#fff" : C.muted,
                    cursor: "pointer", fontFamily: FM, fontSize: ".82rem", fontWeight: "700",
                }}>{p}</button>
            ))}
            {hi < totalPages && <><span style={{ color: C.muted }}>…</span><span style={{ fontFamily: FM, fontSize: ".8rem", padding: "4px 8px", cursor: "pointer" }} onClick={() => onChange(totalPages)}>{totalPages}</span></>}
            <Btn size="sm" variant="ghost" disabled={!hasNextPage} onClick={() => onChange(page + 1)}>Next →</Btn>
        </div>
    );
}