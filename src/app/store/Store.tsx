import { create } from 'zustand';
import { login, fetchUser, logout, register } from "../lib/api";

interface AuthState {
    user: {
        id: string;
        full_name: string;
        email: string;
        phone_number?: string;
        job_title?: string;
        profile_picture_url?: string;
        role: string;
        workspace_id: string;
        subscription_plan: "free" | "solo" | "firm";
        subscription_status: "trialing" | "active" | "past_due" | "canceled";
    } | null;
    setUser: (user: AuthState['user']) => void;
    logout: () => void;
    url: string;
    loginUser: (email: string, password: string, url: string) => Promise<{ role: string;[key: string]: unknown } | void>;
    userAuth: boolean
    userValid: () => Promise<void>;
    registerUser: (username: string, email: string, password: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    userAuth: false,
    url: 'http://localhost:8000',
    // url: 'https://panel-abogados-backend.onrender.com',
    // url: "https://gfncp124-8000.use.devtunnels.ms",
    setUser: (user) => set({ user }),
    loginUser: async (email, password) => {
        // 1. Hacemos el login para obtener la cookie
        const loginResponse = await login(email, password, useAuthStore.getState().url);
        if (!loginResponse.ok) { // Verificamos que la respuesta del login fue exitosa
            throw new Error('Credenciales incorrectas');
        }

        // 2. Obtenemos los datos del usuario
        const userData = await fetchUser(useAuthStore.getState().url);
        if (!userData) {
            // Si no se obtienen datos del usuario, algo falló
            set({ userAuth: false, user: null });
            throw new Error('No se pudieron obtener los datos del usuario después del login.');
        }

        // 3. Actualizamos el estado y devolvemos los datos del usuario
        set({ userAuth: true, user: userData });
        return userData; // <-- ¡CAMBIO CLAVE!
    },
    userValid: async () => {
        try {
            const data = await fetchUser(useAuthStore.getState().url);
            if (!data) {
                set({ userAuth: false, user: null });
                return;
            }
            set({ userAuth: true, user: data });
        } catch {
            // Si falla fetchUser (ej. 401), asumimos que no hay sesión válida
            set({ userAuth: false, user: null });
        }
    },
    // 📌 Cerrar sesión
    logout: async () => {
        try {
            await logout(useAuthStore.getState().url);
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        } finally {
            // Limpiamos el estado y redirigimos siempre, incluso si falla la petición al backend
            set({ user: null, userAuth: false });
            window.location.href = "/auth/login";
        }
    },
    registerUser: async (username, email, password) => {
        const success = await register(username, email, password, useAuthStore.getState().url);
        if (!success) {
            return false;
        }
        return success;
    },

}));
