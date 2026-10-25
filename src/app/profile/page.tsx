"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/Store";
import ProtectedRoute from "../components/ProtectedRoutes";

export default function ProfilePage() {
    const router = useRouter();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) return;
        if (user.role === "client") {
            router.replace("/portal-cliente");
        } else {
            router.replace("/dashboard/settings");
        }
    }, [user, router]);

    return (
        <ProtectedRoute>
            <div className="p-8 text-center text-muted-foreground">Redirigiendo a tu perfil...</div>
        </ProtectedRoute>
    );
}
