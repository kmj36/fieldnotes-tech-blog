import type { NavState } from "@/shared/api";
import type { AuthState } from "@/feature/auth/types";

interface HeaderProps { nav: NavState; setNav: (n: NavState) => void; auth: AuthState; onLogout: () => void; }

interface ConfigBarProps { base: string; onSave: (url: string) => void; }

export type {
    HeaderProps,
    ConfigBarProps
};