import type { PostFormProps, PostFormState } from "../types";
import type { TagPublic } from "@/feature/tags/types";
import type { CategoryPublic } from "@/feature/categories/types";
import { api } from "@/shared/api";
import type { SelectOption } from "@/shared/components";
import { Modal, Alert, Input, Sel, Field, Btn, Chip } from '@/shared/components';
import { C, FB } from "@/shared/constants";
import { useState } from "react";
import type { PostBody } from "../types";
import ReactMarkdown from "react-markdown";
import MDEditor from "@uiw/react-md-editor";
import { markdownComponents } from "@/shared/components/MarkdownCodeBlock";

/* ─── Post Form (create / edit modal) ──────────────────────── */

export default function PostForm({ post, cats, tags, onClose, onSave }: PostFormProps) {
    const isEdit = !!post;
    const [f, setF] = useState<PostFormState>({
        slug: post?.slug ?? "",
        title: post?.title ?? "",
        content: post?.content ?? "",
        thumbnail: post?.thumbnail ?? "",
        categoryId: post?.category?.id?.toString() ?? "",
        tagSlugs: post?.tags?.map((t: TagPublic) => t.slug) ?? [],
        isPrivate: post?.isPrivate ?? false,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);

    const catOpts: SelectOption[] = [
        { value: "", label: "카테고리 없음" },
        ...cats.slice().sort((a: CategoryPublic, b: CategoryPublic) => a.path.localeCompare(b.path)).map((c: CategoryPublic) => ({
            value: c.id.toString(),
            label: `${"  ".repeat(c.path.split("/").length - 2)}${c.name}  (${c.path})`,
        })),
    ];

    const up = <K extends keyof PostFormState>(k: K) => (v: PostFormState[K]) =>
        setF((p: PostFormState) => ({ ...p, [k]: v }));
    const toggleTag = (slug: string) => setF((p: PostFormState) => ({
        ...p,
        tagSlugs: p.tagSlugs.includes(slug) ? p.tagSlugs.filter((s: string) => s !== slug) : [...p.tagSlugs, slug],
    }));

    async function save(): Promise<void> {
        if (!f.title || !f.slug || !f.content) return setErr("슬러그, 제목, 내용은 필수입니다.");
        setLoading(true); setErr(null);
        try {
            const body: PostBody = {
                slug: f.slug, title: f.title, content: f.content,
                thumbnail: f.thumbnail || null, categoryId: f.categoryId ? parseInt(f.categoryId) : null,
                tagSlugs: f.tagSlugs, isPrivate: f.isPrivate
            };
            if (isEdit && post) await api.updatePost(post.id, body);
            else await api.createPost(body);
            onSave();
        } catch (e) { setErr((e as Error).message); }
        finally { setLoading(false); }
    }

    return (
        <Modal title={isEdit ? "게시물 수정" : "새 게시물 작성"} onClose={onClose} width="720px">
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {err && <Alert msg={err} onClose={() => setErr(null)} />}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <Input label="제목 *" value={f.title} onChange={up("title")} placeholder="게시물 제목" />
                    <Input label="슬러그 *" value={f.slug} onChange={up("slug")} placeholder="my-post-slug" />
                </div>
                <Input label="썸네일 URL" value={f.thumbnail} onChange={up("thumbnail")} placeholder="https://…" />
                <Field label="내용 * (Markdown 지원)">
                    <div data-color-mode="light">
                        <MDEditor
                            value={f.content}
                            onChange={(v) => up("content")(v ?? "")}
                            height={400}
                            preview="live"
                            components={{
                                preview: (source) => (
                                    <ReactMarkdown components={markdownComponents}>
                                        {source}
                                    </ReactMarkdown>
                                ),
                            }}
                        />
                    </div>
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                    <Sel label="카테고리" value={f.categoryId} onChange={up("categoryId")} options={catOpts} />
                    <Field label="공개 여부">
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontFamily: FB, fontSize: ".9rem", padding: "9px 0" }}>
                            <input type="checkbox" checked={f.isPrivate} onChange={e => up("isPrivate")(e.target.checked)} />
                            비공개 설정
                        </label>
                    </Field>
                </div>
                <Field label="태그 선택">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "4px 0" }}>
                        {tags.map((t: TagPublic) => <Chip key={t.id} label={t.name} active={f.tagSlugs.includes(t.slug)} onClick={() => toggleTag(t.slug)} />)}
                    </div>
                </Field>
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", paddingTop: "8px", borderTop: `1px solid ${C.border}` }}>
                    <Btn variant="ghost" onClick={onClose}>취소</Btn>
                    <Btn disabled={loading} onClick={save}>{loading ? "저장 중…" : isEdit ? "수정 저장" : "게시물 생성"}</Btn>
                </div>
            </div>
        </Modal>
    );
}
