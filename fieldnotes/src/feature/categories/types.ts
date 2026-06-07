import type { SortDir } from "@/shared/api/types";

export interface CategoryTreeProps {
    cats: CategoryPublic[];
    selectedId: number | null;
    onSelect: (id: number | null) => void;
}

export interface CatModalState {
    mode: "create" | "edit";
    item?: CategoryPublic;
}

export interface CatFormProps {
    item?: CategoryPublic;
    cats: CategoryPublic[];
    onClose: () => void;
    onSave: () => void;
}
export interface CategoryPublic {
  id: number; parentId: number | null;
  name: string; slug: string; path: string;
}
export interface CategoryDetail extends CategoryPublic { createdAt: string; updatedAt: string; }
export interface CategoryNode extends CategoryPublic { children: CategoryNode[]; }

export interface CategoryListResult { meta: { limit: number }; data: CategoryPublic[]; }

export interface CategoryQueryParams {
  limit?: number; sortBy?: string; sortDir?: SortDir;
  id?: number; parentId?: number; name?: string; slug?: string;
}

export interface CategoryBody { name: string; slug: string; parentId?: number | null; }