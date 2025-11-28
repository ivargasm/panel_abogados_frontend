"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/app/store/Store';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import DashboardContent from './DashboardContent';

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user, userValid } = useAuthStore();

    React.useEffect(() => {
        // Escuchamos los parámetros de la URL al cargar la página
        const paymentStatus = searchParams.get('payment');

        if (paymentStatus === 'success') {
            toast.success('¡Pago exitoso!', {
                description: 'Tu plan ha sido actualizado a Profesional. ¡Bienvenido!',
            });
            // Refrescamos los datos del usuario para que la UI se actualice con el nuevo plan
            userValid();
            // Limpiamos la URL para que el mensaje no vuelva a aparecer si se recarga
            router.replace('/dashboard');
        }
    }, [searchParams, router, userValid]);

    return (
        <ProtectedRoute allowedRoles={['owner', 'lawyer']}>
            <Suspense fallback={<div>Cargando dashboard...</div>}>
                <DashboardContent />
            </Suspense>
        </ProtectedRoute>
    );
}
