import useAsync from "@/shared/hooks/useAsync";
import { useState } from "react";
import { api } from "@/shared/api";
import { Spinner, Alert, Btn } from "@/shared/components";
import { C, FH } from "@/shared/constants";
import PostForm from "../components/PostForm";
import { useNavigate, useParams } from "react-router-dom";

/* ─── Admin Post Edit Page ────────────────────────────────── */
export default function AdminPostEditPage() {
    const { postSlug = "" } = useParams();
    const navigate = useNavigate();

    const { data, loading, error } = useAsync(() => api.getPostAdmin(postSlug), [postSlug]);
    const { data: catRes } = useAsync(() => api.getCategories({ limit: 200 }), []);
    const { data: tagRes } = useAsync(() => api.getTags({ limit: 100 }), []);
    const [saved, setSaved] = useState<boolean>(false);

    if (loading) return <Spinner />;
    if (error) return <Alert msg={error} />;
    const post = data?.result;
    if (!post) return null;

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <Btn variant="ghost" size="sm" onClick={() => navigate("/admin/posts")}>← 목록</Btn>
                <h2 style={{ margin: 0, fontFamily: FH, fontSize: "1.5rem", color: C.ink }}>게시물 수정</h2>
            </div>
            {post && !saved && (
                <PostForm
                    post={post}
                    cats={catRes?.result?.data || []}
                    tags={tagRes?.result?.data || []}
                    onClose={() => navigate("/admin/posts")}
                    onSave={() => { setSaved(true); setTimeout(() => navigate("/admin/posts"), 800); }}
                />
            )}
            {saved && <Alert type="success" msg="게시물이 성공적으로 수정되었습니다. 목록으로 이동합니다…" />}
        </div>
    );
}