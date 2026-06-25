import type { TagPublic } from "../tags/types";
import type { NavState } from "@/shared/api";
import type { Pagination, SortDir } from "@/shared/api/types";
import type { AuthState } from "../auth/types";
import type { CategoryPublic } from "../categories/types";

interface PostFormState {
    slug: string; title: string; content: string; thumbnail: string;
    categoryId: string; tagSlugs: string[]; isPrivate: boolean;
}

interface PostFormProps {
    post?: PostDetail; cats: CategoryPublic[]; tags: TagPublic[];
    onClose: () => void; onSave: () => void;
}

interface PostCardProps { post: PostPublic; onClick: (slug: string) => void; }

interface PostDetailPageProps { slug: string; setNav: (n: NavState) => void; auth: AuthState; }

interface AdminPostEditPageProps { postSlug: string; setNav: (n: NavState) => void; }

interface PostPublic {
  id: number; nickname: string; accountId?: string; slug: string;
  title: string; excerpt: string; thumbnail: string | null;
  isPrivate: boolean; createdAt: string; updatedAt: string;
  publishedAt: string | null; category: CategoryPublic | null; tags: TagPublic[];
}

interface PostDetail extends PostPublic { content: string; }

interface PostListResult { meta: { pagination: Pagination }; data: PostPublic[]; }

interface PostQueryParams {
  page?: number; pageLimit?: number; sortBy?: string; sortDir?: SortDir;
  id?: number; nickname?: string; matchType?: string; slug?: string; title?: string;
  categoryId?: number; tagSlugs?: string; dateFilter?: string; dateTarget?: string;
  dateFrom?: string; dateTo?: string; isPrivate?: boolean;
}

interface PostBody {
  slug: string; title: string; content: string;
  thumbnail?: string | null; categoryId?: number | null; tagSlugs?: string[]; isPrivate?: boolean;
}

export type {
    PostBody,
    PostCardProps,
    PostDetail,
    PostDetailPageProps,
    PostFormProps,
    PostFormState,
    PostListResult,
    PostPublic,
    PostQueryParams,
    AdminPostEditPageProps
};