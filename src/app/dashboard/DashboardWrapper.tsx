"use client";

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/app/store/Store';
import DashboardContent from './DashboardContent';

export function DashboardWrapper() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { userValid } = useAuthStore();

    useEffect(() => {
        const paymentStatus = searchParams.get('payment');

        if (paymentStatus === 'success') {
            toast.success('¡Pago exitoso!', {
                description: 'Tu plan ha sido actualizado a Profesional. ¡Bienvenido!',
            });
            userValid();
            router.replace('/dashboard');
        }
    }, [searchParams, router, userValid]);

    return <DashboardContent />;
}