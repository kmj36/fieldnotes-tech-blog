import type { AuthState } from "@/feature/auth/types";

interface HeaderProps { auth: AuthState; onLogout: () => void; }

export type {
    HeaderProps
};