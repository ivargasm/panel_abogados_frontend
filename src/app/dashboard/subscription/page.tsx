"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/Store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Zap } from "lucide-react";
import { API_URL, createCheckoutSession, createCustomerPortalSession } from "@/app/lib/api";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface UsageStats {
    plan: string;
    status: string;
    usage: {
        clients: number;
        cases: number;
        users: number;
        storage_mb: number;
    };
    limits: {
        clients: number;
        cases: number;
        users: number;
        storage_mb: number;
    };
}

const planFeatures = {
    free: [
        "Hasta 3 expedientes activos",
        "Hasta 5 clientes en cartera",
        "Titular + 1 colaborador asociado",
        "500 MB de expediente digital seguro",
        "Portal del cliente y Agenda procesal",
    ],
    solo: [
        "Expedientes activos ilimitados",
        "Clientes ilimitados",
        "10 GB de almacenamiento en la nube",
        "Estados de cuenta y recibos imprimibles",
        "Soporte prioritario para el despacho",
    ],
};

function SubscriptionPageBody() {
    const { user, url } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

    useEffect(() => {
        const paymentStatus = searchParams.get("payment");
        if (paymentStatus === "canceled") {
            toast.info("Proceso de pago cancelado", {
                description: "Puedes volver a intentarlo cuando quieras desde esta página.",
            });
            router.replace("/dashboard/subscription");
        }
        fetchUsageStats();
    }, [searchParams, router]);

    const fetchUsageStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/subscriptions/usage`, {
                credentials: "include",
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
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo iniciar la suscripción.");
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
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo abrir el portal de facturación.");
            setIsLoading(false);
        }
    };

    const currentPlan = usageStats?.plan || user?.subscription_plan || "free";
    const isSubscribed = currentPlan === "solo" || currentPlan === "firm";
    const isOwner = user?.role === "owner";

    const renderProgressBar = (current: number, max: number, label: string, unit = "") => {
        const isUnlimited = max === -1;
        const percentage = isUnlimited ? 20 : Math.min((current / Math.max(max, 1)) * 100, 100);
        const displayMax = isUnlimited ? "Ilimitado" : `${max}${unit}`;

        return (
            <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="text-muted-foreground">
                        {current}{unit} / {displayMax}
                    </span>
                </div>
                <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className={`h-full ${!isUnlimited && percentage >= 90 ? "bg-red-500" : "bg-primary"} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto max-w-6xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Plan y Capacidad del Despacho</h1>
                <p className="text-muted-foreground">
                    Consulta el uso de expedientes, cartera de clientes, integrantes y almacenamiento documental.
                </p>
            </div>

            {usageStats && (
                <Card>
                    <CardHeader>
                        <CardTitle>Consumo Actual del Despacho</CardTitle>
                        <CardDescription className="flex items-center gap-2 pt-1">
                            <span>Plan activo:</span>
                            <Badge variant="default" className="uppercase">{usageStats.plan}</Badge>
                            <span>Estado:</span>
                            <Badge variant="outline">{usageStats.status}</Badge>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {renderProgressBar(usageStats.usage.clients, usageStats.limits.clients, "Clientes activos")}
                            {renderProgressBar(usageStats.usage.cases, usageStats.limits.cases, "Expedientes en trámite")}
                            {renderProgressBar(usageStats.usage.users, usageStats.limits.users, "Integrantes del despacho")}
                            {renderProgressBar(
                                Number(usageStats.usage.storage_mb.toFixed(1)),
                                usageStats.limits.storage_mb,
                                "Almacenamiento",
                                " MB"
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Card className={!isSubscribed ? "border-primary border-2" : "opacity-75"}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="text-muted-foreground h-5 w-5" /> Plan Inicial
                        </CardTitle>
                        <CardDescription>Ideal para evaluación académica o abogados independientes iniciando su cartera.</CardDescription>
                        <p className="text-3xl font-bold mt-2">Sin costo</p>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {planFeatures.free.map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {!isSubscribed && (
                            <Button variant="outline" disabled className="w-full">
                                Plan Activo Actual
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                <Card className={isSubscribed ? "border-emerald-500 border-2" : ""}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="text-amber-500 h-5 w-5" /> Plan Despacho Profesional
                        </CardTitle>
                        <CardDescription>Capacidad ilimitada en expedientes y clientes para firmas jurídicas en crecimiento.</CardDescription>
                        <p className="text-3xl font-bold mt-2">
                            $400 <span className="text-base font-normal text-muted-foreground">MXN / mes</span>
                        </p>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {planFeatures.solo.map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-sm">
                                    <Zap className="h-4 w-4 text-primary shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {!isOwner ? (
                            <Button variant="outline" disabled className="w-full">
                                Solo el titular del despacho puede modificar el plan
                            </Button>
                        ) : isSubscribed ? (
                            <Button onClick={handleManageSubscription} disabled={isLoading} className="w-full cursor-pointer">
                                {isLoading ? "Cargando..." : "Administrar Suscripción"}
                            </Button>
                        ) : (
                            <Button onClick={handleUpgrade} disabled={isLoading} className="w-full cursor-pointer">
                                {isLoading ? "Conectando con pasarela..." : "Actualizar a Plan Profesional"}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

export default function SubscriptionPage() {
    return (
        <Suspense fallback={<div>Cargando suscripción...</div>}>
            <SubscriptionPageBody />
        </Suspense>
    );
}
