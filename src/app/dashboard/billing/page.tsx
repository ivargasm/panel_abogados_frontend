"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/store/Store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Zap } from "lucide-react";
import { createCheckoutSession, createCustomerPortalSession } from '@/app/lib/api';
import { toast } from 'sonner';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import { useRouter, useSearchParams } from 'next/navigation';

const planFeatures = {
    free: [
        "Hasta 3 casos activos",
        "Hasta 5 clientes",
        "500 MB de almacenamiento",
        "Portal del cliente",
        "Calendario de eventos"
    ],
    solo: [
        "Casos activos ilimitados",
        "Clientes ilimitados",
        "10 GB de almacenamiento",
        "Soporte prioritario por correo",
        "Todas las funciones del plan Básico"
    ]
};

export default function BillingPage() {
    // Necesitamos obtener el objeto `user` completo del store para leer su plan
    const { user, url } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    // const router = useRouter();
    const searchParams = useSearchParams();
    const router = useRouter();


    useEffect(() => {
        // Escuchamos el parámetro de cancelación
        const paymentStatus = searchParams.get('payment');

        if (paymentStatus === 'canceled') {
            toast.info('Proceso de pago cancelado', {
                description: 'Puedes volver a intentarlo cuando quieras desde esta página.',
            });
            // Limpiamos la URL
            router.replace('/dashboard/billing');
        }
    }, [searchParams, router]);

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            const { checkout_url } = await createCheckoutSession(url);
            // Redirigimos al usuario a la página de pago de Stripe
            if (checkout_url) {
                window.location.href = checkout_url;
            }
        } catch {
            toast.error("Hubo un problema al iniciar el pago. Inténtalo de nuevo.");
            setIsLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setIsLoading(true);
        try {
            const { portal_url } = await createCustomerPortalSession(url);
            // Redirigimos al usuario al portal de gestión de Stripe
            if (portal_url) {
                window.location.href = portal_url;
            }
        } catch {
            toast.error("Hubo un problema al abrir el portal. Inténtalo de nuevo.");
            setIsLoading(false);
        }
    };

    const currentPlan = user?.subscription_plan || 'free';
    const isSubscribed = currentPlan === 'solo';

    return (
        <ProtectedRoute allowedRoles={['owner']}>
            <div className="container mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Suscripción y Facturación</h1>
                    <p className="text-muted-foreground">Gestiona tu plan y accede a todas las funcionalidades de LexControl.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Plan Gratuito */}
                    <Card className={isSubscribed ? 'opacity-60' : 'border-blue-500 border-2'}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CheckCircle className="text-gray-400" /> Plan Básico</CardTitle>
                            <CardDescription>Ideal para empezar a organizar tus primeros casos.</CardDescription>
                            <p className="text-3xl font-bold mt-2">Gratis</p>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {planFeatures.free.map(feature => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {currentPlan === 'free' && (
                                <Button variant="outline" disabled>Tu Plan Actual</Button>
                            )}
                        </CardFooter>
                    </Card>

                    {/* Plan Profesional */}
                    <Card className={isSubscribed ? 'border-green-500 border-2' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Star className="text-yellow-400" /> Plan Profesional</CardTitle>
                            <CardDescription>Desbloquea todo el potencial de LexControl sin límites.</CardDescription>
                            <p className="text-3xl font-bold mt-2">$200 <span className="text-lg font-normal text-muted-foreground">/ mes</span></p>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {planFeatures.solo.map(feature => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-blue-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {isSubscribed ? (
                                <Button onClick={handleManageSubscription} disabled={isLoading} className='cursor-pointer'>
                                    {isLoading ? 'Cargando...' : 'Gestionar Suscripción'}
                                </Button>
                            ) : (
                                <Button onClick={handleUpgrade} disabled={isLoading} className='cursor-pointer'>
                                    {isLoading ? 'Procesando...' : 'Actualizar a Profesional'}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}

