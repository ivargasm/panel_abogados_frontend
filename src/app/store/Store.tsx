import { create } from "zustand";
import { API_URL, login, fetchUser, logout, register } from "../lib/api";

export interface AuthUser {
    id: number | string;
    full_name: string;
    email: string;
    phone_number?: string;
    job_title?: string;
    professional_license?: string;
    profile_picture_url?: string;
    role: string;
    workspace_id: number | string;
    workspace_name?: string;
    subscription_plan: "free" | "solo" | "firm";
    subscription_status: "trialing" | "active" | "past_due" | "canceled";
}

interface AuthState {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    logout: () => Promise<void>;
    url: string;
    loginUser: (email: string, password: string, url?: string) => Promise<{ role: string; [key: string]: unknown }>;
    userAuth: boolean;
    authChecked: boolean;
    userValid: () => Promise<void>;
    registerUser: (
        username: string,
        email: string,
        password: string,
        extras?: { workspace_name?: string; professional_license?: string }
    ) => Promise<AuthUser>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    userAuth: false,
    authChecked: false,
    url: API_URL,
    setUser: (user) => set({ user, userAuth: Boolean(user), authChecked: true }),
    loginUser: async (email, password) => {
        const baseUrl = get().url;
        await login(email, password, baseUrl);

        const userData = await fetchUser(baseUrl);
        if (!userData) {
            set({ userAuth: false, user: null, authChecked: true });
            throw new Error("No se pudieron obtener los datos del usuario después del inicio de sesión.");
        }

        set({ userAuth: true, user: userData, authChecked: true });
        return userData;
    },
    userValid: async () => {
        try {
            const data = await fetchUser(get().url);
            if (!data) {
                set({ userAuth: false, user: null, authChecked: true });
                return;
            }
            set({ userAuth: true, user: data, authChecked: true });
        } catch {
            set({ userAuth: false, user: null, authChecked: true });
        }
    },
    logout: async () => {
        try {
            await logout(get().url);
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        } finally {
            set({ user: null, userAuth: false, authChecked: true });
            window.location.href = "/auth/login";
        }
    },
    registerUser: async (username, email, password, extras): Promise<AuthUser> => {
        return await register(username, email, password, get().url, extras);
    },
}));
