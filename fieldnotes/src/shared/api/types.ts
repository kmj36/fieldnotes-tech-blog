/* ═══════════════════════════════════════════════════════════════
   DOMAIN TYPES  (derived from OpenAPI spec + DB schema)
═══════════════════════════════════════════════════════════════ */
type AccountRole = "USER" | "ADMIN";
type AccountStatus = "ACTIVE" | "SUSPENDED";
type SortDir = "asc" | "desc";

// ── OpenAPI schema shapes ──────────────────────────────────────
interface TagPublic { id: number; name: string; slug: string; }
interface TagDetail extends TagPublic { createdAt: string; updatedAt: string; }

interface CategoryPublic {
  id: number; parentId: number | null;
  name: string; slug: string; path: string;
}
interface CategoryDetail extends CategoryPublic { createdAt: string; updatedAt: string; }
interface CategoryNode extends CategoryPublic { children: CategoryNode[]; }

interface PostPublic {
  id: number; nickname: string; accountId?: string; slug: string;
  title: string; excerpt: string; thumbnail: string | null;
  isPrivate: boolean; createdAt: string; updatedAt: string;
  publishedAt: string | null; category: CategoryPublic | null; tags: TagPublic[];
}
interface PostDetail extends PostPublic { content: string; }

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
interface PostListResult { meta: { pagination: Pagination }; data: PostPublic[]; }
interface CategoryListResult { meta: { limit: number }; data: CategoryPublic[]; }
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
interface PostQueryParams {
  page?: number; pageLimit?: number; sortBy?: string; sortDir?: SortDir;
  id?: number; nickname?: string; matchType?: string; slug?: string; title?: string;
  categoryId?: number; tagSlugs?: string; dateFilter?: string; dateTarget?: string;
  dateFrom?: string; dateTo?: string; isPrivate?: boolean;
}
interface CategoryQueryParams {
  limit?: number; sortBy?: string; sortDir?: SortDir;
  id?: number; parentId?: number; name?: string; slug?: string;
}
interface TagQueryParams {
  limit?: number; sortBy?: string; sortDir?: SortDir; id?: number; name?: string; slug?: string;
}
interface AccountQueryParams {
  limit?: number; sortBy?: string; sortDir?: SortDir; id?: number;
  accountId?: string; nickname?: string; role?: AccountRole; status?: AccountStatus;
}
interface PostBody {
  slug: string; title: string; content: string;
  thumbnail?: string | null; categoryId?: number | null; tagSlugs?: string[]; isPrivate?: boolean;
}
interface CategoryBody { name: string; slug: string; parentId?: number | null; }
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
  CategoryPublic,
  CategoryDetail,
  CategoryNode,
  PostDetail,
  ApiResponse,
  PostListResult,
  CategoryListResult,
  TagListResult,
  AccountRole,
  AccountStatus,
  AccountPublic,
  AccountDetail,
  AccountListResult,
  LoginResult,
  NavState,
  AuthState,
  PostQueryParams,
  CategoryQueryParams,
  TagQueryParams,
  AccountQueryParams,
  PostBody,
  CategoryBody,
  TagBody,
  AccountRegisterBody,
  AccountUpdateBody,
  QSParams,
  PostPublic,
  PageKey
};