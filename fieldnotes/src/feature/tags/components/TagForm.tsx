import { useState } from "react";
import type { TagFormProps } from "../types";
import { api } from "@/shared/api";
import { Alert, Btn, Input, Modal } from "@/shared/components";

function getButtonLabel(loading: boolean, isEdit: boolean): string {
  if (loading) return "저장 중...";
  return isEdit ? "수정" : "태그 생성";
}

export default function TagForm({ item, onClose, onSave }: Readonly<TagFormProps>) {
  const isEdit = !!item;
  const [name, setName] = useState<string>(item?.name ?? "");
  const [slug, setSlug] = useState<string>(item?.slug ?? "");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!name || !slug) return setErr("이름과 슬러그는 필수입니다.");
    setLoading(true); setErr(null);
    try {
      if (isEdit) await api.updateTag(item.id, { name, slug });
      else await api.createTag({ name, slug });
      onSave();
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={isEdit ? "태그 수정" : "새 태그"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {err && <Alert msg={err} onClose={() => setErr(null)} />}
        <Input label="태그 이름 *" value={name} onChange={setName} placeholder="태그 이름" />
        <Input label="슬러그 *" value={slug} onChange={setSlug} placeholder="tag-slug" />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>취소</Btn>
          <Btn disabled={loading} onClick={save}>{getButtonLabel(loading, isEdit)}</Btn>
        </div>
      </div>
    </Modal>
  );
}