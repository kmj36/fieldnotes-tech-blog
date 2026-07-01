import type { PostBody, PostFormProps, PostFormState } from "../types";
import type { TagPublic } from "@/feature/tags/types";
import type { CategoryPublic } from "@/feature/categories/types";
import { api } from "@/shared/api";
import type { SelectOption } from "@/shared/components";
import { Modal, Alert, Input, Sel, Field, Btn, Chip } from '@/shared/components';
import { C, FB } from "@/shared/constants";
import { useState } from "react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import type { ICommand } from "@uiw/react-md-editor";
import { MarkdownViewer } from "@/shared/components/MarkdownCodeBlock";

/* ─── Post Form (create / edit modal) ──────────────────────── */

function getButtonLabel(loading: boolean, isEdit: boolean): string {
    if (loading) return "저장 중...";
    return isEdit ? "수정" : "게시물 생성";
}

const mdEditorComponents = {
    preview: (source: string) => <MarkdownViewer source={source} />
}

// 💡 외부 커맨드에서 내부 업로드 핸들러를 호출할 수 있도록 징검다리 전역 변수를 선언합니다.
let globalUploadHandler: ((file: File, insertText: (text: string) => void) => Promise<void>) | null = null;

const imageCmd: ICommand = {
    ...commands.image,
    execute: async (_, apiRef) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async () => {
            if (input.files && input.files[0] && globalUploadHandler) {
                // 컴포넌트 내부에 바인딩된 업로드 처리기 실행
                await globalUploadHandler(input.files[0], (text) => {
                    apiRef.replaceSelection(text);
                });
            }
        };
        input.click();
    }
};

const mathCmd: ICommand = {
    name: "math",
    keyCommand: "math",
    buttonProps: { "aria-label": "수식", title: "수식 (LaTeX)" },
    icon: <span style={{ fontStyle: "italic", fontWeight: 700, fontFamily: "serif" }}>fx</span>,
    execute: (state, api) => {
        const sel = state.selectedText || "E = mc^2";
        api.replaceSelection(`\n$$\n${sel}\n$$\n`);
    },
};

const alignLeftcmd = {
    name: "align-left",
    keyCommand: "align-left",
    buttonProps: { "aria-label": "왼쪽 정렬" },
    icon: <span style={{ fontSize: "12px" }}>⬅</span>,
    execute: (state: { selectedText: string }, api: { replaceSelection: (text: string) => void }) => {
        const text = state.selectedText || "텍스트";
        api.replaceSelection(`<div style="text-align:left">\n\n${text}\n\n</div>`);
    },
};

const alignCentercmd = {
    name: "align-center",
    keyCommand: "align-center",
    buttonProps: { "aria-label": "가운데 정렬" },
    icon: <span style={{ fontSize: "12px" }}>☰</span>,
    execute: (state: { selectedText: string }, api: { replaceSelection: (text: string) => void }) => {
        const text = state.selectedText || "텍스트";
        api.replaceSelection(`<div style="text-align:center">\n\n${text}\n\n</div>`);
    },
};

const alignRightcmd = {
    name: "align-right",
    keyCommand: "align-right",
    buttonProps: { "aria-label": "오른쪽 정렬" },
    icon: <span style={{ fontSize: "12px" }}>➡</span>,
    execute: (state: { selectedText: string }, api: { replaceSelection: (text: string) => void }) => {
        const text = state.selectedText || "텍스트";
        api.replaceSelection(`<div style="text-align:right">\n\n${text}\n\n</div>`);
    },
};

export default function PostForm({ post, cats, tags, onClose, onSave }: Readonly<PostFormProps>) {
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
    const [uploading, setUploading] = useState<boolean>(false); // 💡 이미지 업로드 전용 로딩 추가
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

    // 💡 컴포넌트 내부에 상태 제어가 가능한 실제 업로드 실행 로직을 작성합니다.
    const executeImageUpload = async (file: File, insertText: (text: string) => void) => {
        setUploading(true);
        setErr(null);
        try {
            const res = await api.imageUpload({ image: file });
            const imageUrl = res?.result?.url || (res as any)?.url;
            const filename = res?.result?.filename || (res as any)?.filename || "image";
            
            if (imageUrl) {
                insertText(`![${filename}](${imageUrl})`);
            } else {
                throw new Error("서버로부터 이미지 주소를 받지 못했습니다.");
            }
        } catch (e) {
            console.error("Image upload error:", e);
            setErr((e as Error).message || "이미지 업로드 중 오류가 발생했습니다.");
        } finally {
            setUploading(false);
        }
    };

    // 외부 선언된 imageCmd가 이 함수를 바라보도록 바인딩합니다.
    globalUploadHandler = executeImageUpload;

    async function save(): Promise<void> {
        if (!f.title || !f.slug || !f.content) return setErr("슬러그, 제목, 내용은 필수입니다.");
        setLoading(true); setErr(null);
        try {
            const body: PostBody = {
                slug: f.slug, title: f.title, content: f.content,
                thumbnail: f.thumbnail || null, categoryId: f.categoryId ? Number.parseInt(f.categoryId) : null,
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
                
                {/* 💡 업로드 진행 상황을 라벨 옆에 시각적으로 표시해 줍니다. */}
                <Field label={`내용 * (Markdown 지원) ${uploading ? " ─ 이미지 업로드 중..." : ""}`}>
                    <div data-color-mode="light">
                        <MDEditor
                            value={f.content}
                            onChange={(v) => up("content")(v ?? "")}
                            height={400}
                            preview="live"
                            commands={[
                                commands.bold,
                                commands.italic,
                                commands.strikethrough,
                                commands.hr,
                                commands.divider,
                                commands.quote,
                                commands.code,
                                commands.codeBlock,
                                imageCmd, // 툴바 버튼 연동
                                commands.checkedListCommand,
                                commands.table,
                                mathCmd,
                                commands.divider,
                                alignLeftcmd, alignCentercmd, alignRightcmd,
                            ]}
                            components={mdEditorComponents}
                            // 💡 에디터 위로 드래그 앤 드롭 및 이미지 복사 붙여넣기(Ctrl+V) 시 작동하는 속성입니다.
                            textareaProps={{
                            onPaste: async (e) => {
                                const items = e.clipboardData?.items;
                                if (!items) return;
                                for (const item of Array.from(items)) {
                                    if (item.type.startsWith("image/")) {
                                        e.preventDefault(); // 기본 붙여넣기 동작 방지
                                        const file = item.getAsFile();
                                        if (file && globalUploadHandler) {
                                            // 현재 커서 위치를 찾기 위한 헬퍼
                                            const target = e.target as HTMLTextAreaElement;
                                            const start = target.selectionStart;
                                            const end = target.selectionEnd;
                                            
                                            await globalUploadHandler(file, (markdownText) => {
                                                const currentContent = f.content;
                                                // 커서 위치에 마크다운 텍스트 삽입
                                                const newContent = currentContent.substring(0, start) + markdownText + currentContent.substring(end);
                                                up("content")(newContent);
                                            });
                                        }
                                    }
                                }
                            },
                            onDrop: async (e) => {
                                const files = e.dataTransfer?.files;
                                if (!files) return;
                                for (const file of Array.from(files)) {
                                    if (file.type.startsWith("image/")) {
                                        e.preventDefault(); // 기본 드롭 동작(파일 열기) 방지
                                        if (globalUploadHandler) {
                                            const target = e.target as HTMLTextAreaElement;
                                            const start = target.selectionStart;
                                            const end = target.selectionEnd;

                                            await globalUploadHandler(file, (markdownText) => {
                                                const currentContent = f.content;
                                                const newContent = currentContent.substring(0, start) + markdownText + currentContent.substring(end);
                                                up("content")(newContent);
                                            });
                                        }
                                    }
                                }
                            }
                        }}
                        />
                    </div>
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                    <Sel label="카테고리" value={f.categoryId} onChange={up("categoryId")} options={catOpts} />
                    <Field label="공개 여부">
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontFamily: FB, fontSize: ".9rem", padding: "9px 0" }}>
                            <input type="checkbox" checked={f.isPrivate} onChange={e => up("isPrivate")(e.target.checked)} />비공개 설정
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
                    {/* 💡 이미지가 올라가는 도중에는 본문 저장을 막기 위해 uploading 조건도 추가했습니다. */}
                    <Btn disabled={loading || uploading} onClick={save}>{getButtonLabel(loading, isEdit)}</Btn>
                </div>
            </div>
        </Modal>
    );
}