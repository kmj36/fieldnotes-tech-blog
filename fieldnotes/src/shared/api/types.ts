/* ═══════════════════════════════════════════════════════════════
   DOMAIN TYPES  (derived from OpenAPI spec + DB schema)
═══════════════════════════════════════════════════════════════ */
type AccountRole = "USER" | "ADMIN";
type AccountStatus = "ACTIVE" | "SUSPENDED";
type SortDir = "asc" | "desc";

// ── OpenAPI schema shapes ──────────────────────────────────────
interface TagPublic { id: number; name: string; slug: string; }
interface TagDetail extends TagPublic { createdAt: string; updatedAt: string; }

interface AccountPublic {
  id: number; accountId: string; nickname: string;
  avatarUrl: string | null; role: AccountRole; status: AccountStatus;
}
interface AccountDetail extends AccountPublic { createdAt: string; updatedAt: string; }

// ── API wrappers ───────────────────────────────────────────────
interface Pagination {
  page: number; pageLimit: number; total: number; totalPages: number;
  hasNextPage: boolean; hasPrevPage: boolean;
}
interface ApiResponse<T = unknown> {
  status: number; code: string; detail: string; message: string;
  timestamp: string; path: string; result?: T;
}


interface TagListResult { meta: { limit: number }; data: TagPublic[]; }
interface AccountListResult { meta: object; data: AccountPublic[]; }
interface LoginResult { AccountID: string; token: string; }

// ── Router / Auth ──────────────────────────────────────────────
type PageKey =
  | "home" | "post" | "login"
  | "admin" | "admin-posts" | "admin-post-edit"
  | "admin-categories" | "admin-tags" | "admin-accounts";

interface NavState { page: PageKey; slug?: string; postSlug?: string; }
interface AuthState { token: string | null; user: AccountDetail | null; accountId: string; }

// ── API param shapes ───────────────────────────────────────────

interface TagQueryParams {
  limit?: number; sortBy?: string; sortDir?: SortDir; id?: number; name?: string; slug?: string;
}
interface AccountQueryParams {
  limit?: number; sortBy?: string; sortDir?: SortDir; id?: number;
  accountId?: string; nickname?: string; role?: AccountRole; status?: AccountStatus;
}

interface TagBody { name: string; slug: string; }
interface AccountRegisterBody {
  accountId: string; password: string; nickname: string;
  avatarUrl?: string; role: AccountRole; status: AccountStatus;
}
interface AccountUpdateBody {
  password?: string; nickname?: string; avatarUrl?: string | null;
  role?: AccountRole; status?: AccountStatus;
}
type QSParams = Record<string, string | number | boolean | undefined | null>;

export type {
  TagPublic,
  TagDetail,
  ApiResponse,
  TagListResult,
  AccountRole,
  AccountStatus,
  AccountPublic,
  AccountDetail,
  AccountListResult,
  LoginResult,
  NavState,
  AuthState,
  TagQueryParams,
  AccountQueryParams,
  TagBody,
  AccountRegisterBody,
  AccountUpdateBody,
  QSParams,
  PageKey,
  Pagination,
  SortDir
};