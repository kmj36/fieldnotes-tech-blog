import type { ReactNode } from "react";
import type { SortDir } from "@/shared/api/types";
import type { NavState } from "@/shared/api/types";

export type AccountRole = "USER" | "ADMIN";
export type AccountStatus = "ACTIVE" | "SUSPENDED";

export interface AccountPublic {
  id: number; accountId: string; nickname: string;
  avatarUrl: string | null; role: AccountRole; status: AccountStatus;
}
export interface AccountDetail extends AccountPublic { createdAt: string; updatedAt: string; }

export interface AccountModalState { item?: AccountPublic; }

export interface AccountListResult { meta: object; data: AccountPublic[]; }

export interface AuthState { token: string | null; user: AccountDetail | null; accountId: string; }

export interface AccountQueryParams {
  limit?: number; sortBy?: string; sortDir?: SortDir; id?: number;
  accountId?: string; nickname?: string; role?: AccountRole; status?: AccountStatus;
}

export interface AccountRegisterBody {
  accountId: string; password: string; nickname: string;
  avatarUrl?: string; role: AccountRole; status: AccountStatus;
}

export interface AccountUpdateBody {
  password?: string; nickname?: string; avatarUrl?: string | null;
  role?: AccountRole; status?: AccountStatus;
}

export interface AccountFormState {
  accountId: string; password: string; nickname: string;
  avatarUrl: string; role: AccountRole; status: AccountStatus;
}

export interface AccountFormProps { item?: AccountPublic; onClose: () => void; onSave: () => void; }

export interface AdminLayoutProps { nav: NavState; setNav: (n: NavState) => void; children: ReactNode; }

export interface AdminDashboardProps { auth: AuthState; setNav: (n: NavState) => void; }

export interface LoginPageProps {
  setNav: (n: NavState) => void;
  onLogin: (data: { token: string; user: AccountDetail | undefined; accountId: string }) => void;
}