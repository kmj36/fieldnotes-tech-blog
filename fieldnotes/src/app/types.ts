import type { AuthState } from "@/feature/auth/types";

interface HeaderProps { auth: AuthState; onLogout: () => void; }

interface ConfigBarProps { base: string; onSave: (url: string) => void; }

export type {
    HeaderProps,
    ConfigBarProps
};