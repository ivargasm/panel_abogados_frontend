"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/Store";

// 1. Actualizamos las props para aceptar una lista de roles
export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const router = useRouter();
    // 2. Obtenemos el objeto 'user' completo del store, que contiene el rol
    const { userAuth, user, userValid } = useAuthStore();

    useEffect(() => {
        const checkAuthAndRole = async () => {
            if (!userAuth) {
                // Si no hay datos de usuario en el estado, intentamos validarlos (ej. recarga de página)
                await userValid();
            }

            // Obtenemos el estado más reciente después de la posible validación
            const state = useAuthStore.getState();

            if (!state.userAuth) {
                // Si después de validar sigue sin estar autenticado, lo mandamos al login.
                router.push("/auth/login");
                return;
            }

            // 3. ¡La nueva lógica de autorización!
            // Si se especificaron roles permitidos y el rol del usuario no está en la lista...
            if (allowedRoles && state.user && !allowedRoles.includes(state.user.role)) {
                // ...lo redirigimos a una página segura para su rol.
                if (state.user.role === 'client') {
                    router.push('/portal-cliente'); // Un cliente intentando acceder a una ruta de abogado
                } else {
                    router.push('/dashboard'); // Un abogado intentando acceder a una ruta de cliente
                }
            }
        };
        checkAuthAndRole();
    }, [userAuth, user, router, userValid, allowedRoles]);

    // 4. Solo mostramos el contenido si está autenticado Y su rol es permitido
    if (userAuth && user && (!allowedRoles || allowedRoles.includes(user.role))) {
        return <>{children}</>;
    }

    // Mientras se verifica, no mostramos nada para evitar parpadeos de contenido no autorizado.
    return null;
}