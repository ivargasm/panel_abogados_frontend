"use client";

import { useAuthStore } from "../store/Store";
import ProtectedRoute from "../components/ProtectedRoutes";

export default function ProfilePage() {
    const { user, logout } = useAuthStore();

    return (
        <ProtectedRoute>
            <div className="max-w-md mx-auto mt-10 p-6 bg-background text-primary rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Perfil del Usuario</h2>
                <p><strong>Nombre:</strong> {user?.full_name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Rol:</strong> {user?.role}</p>
                <p><strong>Workspace:</strong> {user?.workspace_id}</p>
                <button
                    className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                    onClick={logout}
                >
                    Cerrar sesión
                </button>
            </div>
            
        </ProtectedRoute>
    );
}
