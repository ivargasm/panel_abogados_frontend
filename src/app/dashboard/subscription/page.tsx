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
import { Badge } from "@/components/ui/badge";

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

export default function SubscriptionPage() {
    const { user, url } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [usageStats, setUsageStats] = useState<any>(null);

    useEffect(() => {
        const paymentStatus = searchParams.get('payment');

        if (paymentStatus === 'canceled') {
            toast.info('Proceso de pago cancelado', {
                description: 'Puedes volver a intentarlo cuando quieras desde esta página.',
            });
            router.replace('/dashboard/subscription');
        }

        fetchUsageStats();
    }, [searchParams, router]);

    const fetchUsageStats = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/usage`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setUsageStats(data);
            }
        } catch (error) {
            console.error("Error fetching usage stats:", error);
        }
    };

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            const { checkout_url } = await createCheckoutSession(url);
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

    const renderProgressBar = (current: number, max: number | string, label: string) => {
        const limit = typeof max === 'number' ? max : Infinity;
        const percentage = limit === Infinity ? 0 : Math.min((current / limit) * 100, 100);
        const displayMax = limit === Infinity ? "Ilimitado" : limit;

        return (
            <div className="space-y-1">
                <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-muted-foreground">{current} / {displayMax}</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className={`h-full ${percentage > 90 ? 'bg-red-500' : 'bg-primary'} transition-all duration-500`}
                        style={{ width: `${limit === Infinity ? 100 : percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <ProtectedRoute allowedRoles={['owner']}>
            <div className="container mx-auto p-4 md:p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Suscripción</h1>
                    <p className="text-muted-foreground">Gestiona tu plan y accede a todas las funcionalidades de LexControl.</p>
                </div>

                {/* Usage Summary */}
                {usageStats && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Uso del Plan Actual</CardTitle>
                            <CardDescription>
                                Estás en el plan <span className="font-bold uppercase">{usageStats.plan}</span>.
                                Estado: <Badge variant={usageStats.status === 'active' ? 'default' : 'secondary'}>{usageStats.status}</Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-3">
                                {renderProgressBar(usageStats.usage.clients, usageStats.limits.max_clients, "Clientes")}
                                {renderProgressBar(usageStats.usage.cases, usageStats.limits.max_cases, "Casos")}
                                {renderProgressBar(
                                    parseFloat((usageStats.usage.storage_mb / 1024).toFixed(2)),
                                    usageStats.limits.storage_mb === Infinity ? "Ilimitado" : parseFloat((usageStats.limits.storage_mb / 1024).toFixed(2)),
                                    "Almacenamiento (GB)"
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Plan Gratuito */}
                    <Card className={!isSubscribed ? 'border-blue-500 border-2' : 'opacity-60'}>
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
                            {!isSubscribed && (
                                <Button variant="outline" disabled className="w-full">Tu Plan Actual</Button>
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
                                <Button onClick={handleManageSubscription} disabled={isLoading} className='w-full cursor-pointer'>
                                    {isLoading ? 'Cargando...' : 'Gestionar Suscripción'}
                                </Button>
                            ) : (
                                <Button onClick={handleUpgrade} disabled={isLoading} className='w-full cursor-pointer'>
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
