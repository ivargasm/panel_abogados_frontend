"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/Store";

export default function ProtectedRoute({
    children,
    allowedRoles,
}: {
    children: React.ReactNode;
    allowedRoles?: string[];
}) {
    const router = useRouter();
    const { userAuth, user, userValid } = useAuthStore();
    const rolesKey = allowedRoles ? allowedRoles.map((r) => r.toLowerCase()).join(",") : "";

    useEffect(() => {
        const checkAuthAndRole = async () => {
            if (!useAuthStore.getState().userAuth) {
                await userValid();
            }

            const state = useAuthStore.getState();

            if (!state.userAuth || !state.user) {
                router.replace("/auth/login");
                return;
            }

            const currentRole = (state.user.role || "").toLowerCase();
            if (rolesKey) {
                const permitted = rolesKey.split(",");
                if (!permitted.includes(currentRole)) {
                    if (currentRole === "client") {
                        router.replace("/portal-cliente");
                    } else {
                        router.replace("/dashboard");
                    }
                }
            }
        };
        checkAuthAndRole();
    }, [userAuth, user, router, userValid, rolesKey]);

    const normalizedUserRole = (user?.role || "").toLowerCase();
    const isRoleAllowed =
        !allowedRoles || allowedRoles.map((r) => r.toLowerCase()).includes(normalizedUserRole);

    if (userAuth && user && isRoleAllowed) {
        return <>{children}</>;
    }

    return null;
}
