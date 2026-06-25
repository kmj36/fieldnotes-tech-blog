/* ═══════════════════════════════════════════════════════════════
   DOMAIN TYPES  (derived from OpenAPI spec + DB schema)
═══════════════════════════════════════════════════════════════ */

type SortDir = "asc" | "desc";

// ── API wrappers ───────────────────────────────────────────────
interface Pagination {
  page: number; pageLimit: number; total: number; totalPages: number;
  hasNextPage: boolean; hasPrevPage: boolean;
}
interface ApiResponse<T = unknown> {
  status: number; code: string; detail: string; message: string;
  timestamp: string; path: string; result?: T;
}

interface LoginResult { AccountID: string; token: string; }

// ── Router / Auth ──────────────────────────────────────────────
type PageKey =
  | "home" | "post" | "login"
  | "admin" | "admin-posts" | "admin-post-edit"
  | "admin-categories" | "admin-tags" | "admin-accounts";

interface NavState { page: PageKey; slug?: string; postSlug?: string; }

type QSParams = Record<string, string | number | boolean | undefined | null>;

export type {
  ApiResponse,
  LoginResult,
  NavState,
  QSParams,
  PageKey,
  Pagination,
  SortDir
};