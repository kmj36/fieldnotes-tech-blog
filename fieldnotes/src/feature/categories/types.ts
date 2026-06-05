import type { CategoryPublic } from "@/shared/api";

export interface CategoryTreeProps {
    cats: CategoryPublic[];
    selectedId: number | null;
    onSelect: (id: number | null) => void;
}