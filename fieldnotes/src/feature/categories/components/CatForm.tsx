import type { CatFormProps } from "../types";
import { useState } from "react";
import type { SelectOption } from "@/shared/components";
import type { CategoryPublic } from "../types";
import { api } from "@/shared/api";
import { Btn, Modal, Alert, Sel, Input } from "@/shared/components";

export default function CatForm({ item, cats, onClose, onSave }: CatFormProps) {
  const isEdit = !!item;
  const [name, setName] = useState<string>(item?.name ?? "");
  const [slug, setSlug] = useState<string>(item?.slug ?? "");
  const [parentId, setParentId] = useState<string>(item?.parentId?.toString() ?? "");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const parentOpts: SelectOption[] = [
    { value: "", label: "최상위 (부모 없음)" },
    ...cats.filter((c: CategoryPublic) => c.id !== item?.id).sort((a: CategoryPublic, b: CategoryPublic) => a.path.localeCompare(b.path)).map((c: CategoryPublic) => ({
      value: c.id.toString(),
      label: `${"—".repeat(c.path.split("/").length - 2)} ${c.name}`,
    })),
  ];

  async function save() {
    if (!name || !slug) return setErr("이름과 슬러그는 필수입니다.");
    setLoading(true); setErr(null);
    try {
      const body = { name, slug, parentId: parentId ? parseInt(parentId) : null };
      if (isEdit) await api.updateCategory(item.id, body);
      else await api.createCategory(body);
      onSave();
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={isEdit ? "카테고리 수정" : "새 카테고리"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {err && <Alert msg={err} onClose={() => setErr(null)} />}
        <Sel label="부모 카테고리" value={parentId} onChange={setParentId} options={parentOpts} />
        <Input label="이름 *" value={name} onChange={setName} placeholder="카테고리 이름" />
        <Input label="슬러그 *" value={slug} onChange={setSlug} placeholder="category-slug" />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>취소</Btn>
          <Btn disabled={loading} onClick={save}>{loading ? "저장 중…" : isEdit ? "수정" : "생성"}</Btn>
        </div>
      </div>
    </Modal>
  );
}