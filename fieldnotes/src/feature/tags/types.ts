import type { SortDir } from "@/shared/api/types";

interface TagPublic { id: number; name: string; slug: string; }
interface TagDetail extends TagPublic { createdAt: string; updatedAt: string; }

interface TagListResult { meta: { limit: number }; data: TagPublic[]; }

interface TagQueryParams {
  limit?: number; sortBy?: string; sortDir?: SortDir; id?: number; name?: string; slug?: string;
}

interface TagBody { name: string; slug: string; }

interface TagModalState { item?: TagDetail; }

interface TagFormProps { item?: TagDetail; onClose: () => void; onSave: () => void; }

export type {
  TagPublic,
  TagDetail,
  TagListResult,
  TagQueryParams,
  TagBody,
  TagModalState,
  TagFormProps
};