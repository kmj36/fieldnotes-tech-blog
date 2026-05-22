import { C } from "../constants/theme";

export default function Spinner({ size = 32 }: { size?: number }) {
    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <div style={{
                width: size, height: size, border: `3px solid ${C.faint}`,
                borderTopColor: C.accent, borderRadius: "50%", animation: "spin .65s linear infinite",
            }} />
        </div>
    );
}