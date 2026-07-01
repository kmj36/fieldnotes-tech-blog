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

interface ImageUploadBody { image: File | Blob; }

interface ImageUploadResult { url: string; filename: string; }

// ── Router / Auth ──────────────────────────────────────────────

type QSParams = Record<string, string | number | boolean | undefined | null>;

export type {
  ApiResponse,
  LoginResult,
  ImageUploadBody,
  ImageUploadResult,
  QSParams,
  Pagination,
  SortDir
};