import type { ApiResponse, QSParams } from "./types";

/* ═══════════════════════════════════════════════════════════════
    API CLIENT  (fully typed to OpenAPI spec)
═══════════════════════════════════════════════════════════════ */
let _BASE: string = import.meta.env.VITE_API_BASE_URL ?? "";
let _TOKEN: string = "";

const setToken = (t: string | null): void => { _TOKEN = t ?? ""; };

async function req<T = unknown>(
  path: string,
  opts: Omit<RequestInit, "body"> & { body?: unknown } = {}
): Promise<ApiResponse<T>> {
  const isFormData = opts.body instanceof FormData;


  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  if (_TOKEN) headers["Authorization"] = `Bearer ${_TOKEN}`;
  
  const { body, ...rest } = opts;

  let requestBody: BodyInit | undefined;
  if (body === undefined) {
    requestBody = undefined;
  } else if (isFormData) {
    requestBody = body as FormData;
  } else {
    requestBody = JSON.stringify(body);
  }

  const res = await fetch(`${_BASE}${path}`, {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string>) },
    body: requestBody,
  });

  if (res.status === 401) {
    setToken(null);
    localStorage.removeItem("authState");
  }

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

export { req, buildQS, setToken };