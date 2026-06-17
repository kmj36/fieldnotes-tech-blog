import type { AccountFormProps, AccountFormState, AccountUpdateBody, AccountRole, AccountStatus } from "../types";
import { api } from "@/shared/api";
import { useState } from "react";
import { Modal, Alert, Input, Sel, Btn } from "@/shared/components";

function getButtonLabel(loading: boolean, isEdit: boolean): string {
  if (loading) return "저장 중…";
  return isEdit ? "수정" : "계정 생성";
}

export default function AccountForm({ item, onClose, onSave }: Readonly<AccountFormProps>) {
  const isEdit = !!item;
  const [f, setF] = useState<AccountFormState>({
    accountId: item?.accountId ?? "",
    password: "",
    nickname: item?.nickname ?? "",
    avatarUrl: item?.avatarUrl ?? "",
    role: item?.role ?? "ADMIN",
    status: item?.status ?? "ACTIVE",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const up = <K extends keyof AccountFormState>(k: K) => (v: AccountFormState[K]) =>
    setF((p: AccountFormState) => ({ ...p, [k]: v }));

  async function save(): Promise<void> {
    setLoading(true); setErr(null);
    try {
      if (isEdit && item) {
        const body: AccountUpdateBody = { nickname: f.nickname, avatarUrl: f.avatarUrl || null, role: f.role, status: f.status };
        if (f.password) body.password = f.password;
        await api.updateAccount(item.accountId, body);
      } else {
        if (!f.accountId || !f.password || !f.nickname) throw new Error("필수 항목을 입력해주세요.");
        await api.register({ accountId: f.accountId, password: f.password, nickname: f.nickname, avatarUrl: f.avatarUrl || undefined, role: f.role, status: f.status });
      }
      onSave();
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <Modal title={isEdit ? "계정 수정" : "새 계정 생성"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {err && <Alert msg={err} onClose={() => setErr(null)} />}
        {!isEdit && <Input label="계정 ID * (3-32자)" value={f.accountId} onChange={up("accountId")} placeholder="accountId" />}
        <Input label={isEdit ? "새 비밀번호 (변경 시에만 입력)" : "비밀번호 * (8자 이상)"} type="password" value={f.password} onChange={up("password")} placeholder="••••••••" />
        <Input label="닉네임 * (2-20자)" value={f.nickname} onChange={up("nickname")} placeholder="닉네임" />
        <Input label="아바타 URL" value={f.avatarUrl} onChange={up("avatarUrl")} placeholder="https://…" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Sel label="역할" value={f.role} onChange={v => up("role")(v as AccountRole)} options={[{ value: "ADMIN", label: "ADMIN" }, { value: "USER", label: "USER" }]} />
          <Sel label="상태" value={f.status} onChange={v => up("status")(v as AccountStatus)} options={[{ value: "ACTIVE", label: "ACTIVE" }, { value: "SUSPENDED", label: "SUSPENDED" }]} />
        </div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>취소</Btn>
          <Btn disabled={loading} onClick={save}>{getButtonLabel(loading, isEdit)}</Btn>
        </div>
      </div>
    </Modal>
  );
}