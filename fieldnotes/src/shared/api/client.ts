import type { ApiResponse, QSParams } from "./types";

/* ═══════════════════════════════════════════════════════════════
   API CLIENT  (fully typed to OpenAPI spec)
═══════════════════════════════════════════════════════════════ */
let _BASE: string = import.meta.env.VITE_API_BASE_URL ?? "";
let _TOKEN: string = "";

const setBase = (u: string): void => { _BASE = u.replace(/\/$/, ""); };
const setToken = (t: string | null): void => { _TOKEN = t ?? ""; };

async function req<T = unknown>(
  path: string,
  opts: Omit<RequestInit, "body"> & { body?: unknown } = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (_TOKEN) headers["Authorization"] = `Bearer ${_TOKEN}`;
  const { body, ...rest } = opts;
  const res = await fetch(`${_BASE}${path}`, {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string>) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({})) as ApiResponse<T> & { message?: string; detail?: string };
  if (!res.ok) throw new Error(data.message ?? data.detail ?? `HTTP ${res.status}`);
  return data;
}

const buildQS = (p: QSParams = {}): string => {
  const q = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.append(k, String(v));
  });
  return q.toString();
};

export { req, buildQS, setBase, setToken };