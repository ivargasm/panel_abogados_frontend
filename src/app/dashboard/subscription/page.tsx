"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/Store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Zap, Users, ShieldCheck } from "lucide-react";
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
        "1 Abogado titular",
        "Hasta 3 clientes en cartera",
        "Hasta 2 expedientes activos por cliente",
        "500 MB de expediente digital seguro",
        "Portal del cliente y Agenda procesal",
    ],
    solo: [
        "1 Abogado titular (Litigante independiente)",
        "Expedientes y casos ilimitados",
        "Cartera de clientes ilimitada",
        "10 GB de almacenamiento en la nube",
        "Cobranza completa, recibos y estados de cuenta",
        "Extractor inteligente de comprobantes SPEI",
    ],
    firm: [
        "Hasta 5 abogados (Titular + 4 colaboradores)",
        "Expedientes y clientes ilimitados",
        "50 GB de almacenamiento de alta capacidad",
        "Módulo integral de colaboradores y asignación de casos",
        "Validación de cédulas DGP-SEP y bitácora de auditoría",
        "Panel directivo de cobranza y finanzas por abogado",
    ],
};

function SubscriptionPageBody() {
    const { user, url } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
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

    const handleUpgrade = async (plan: "solo" | "firm" = "solo") => {
        setIsLoading(true);
        try {
            const { checkout_url } = await createCheckoutSession(plan, billingCycle, url);
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

            {/* Selector de Ciclo de Facturación (Mensual / Anual) */}
            <div className="flex justify-center pt-2">
                <div className="relative flex items-center rounded-full bg-muted p-1 ring-1 ring-border">
                    <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={`rounded-full px-5 py-2 text-sm font-semibold transition-all cursor-pointer ${
                            billingCycle === "monthly"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Facturación Mensual
                    </button>
                    <button
                        type="button"
                        onClick={() => setBillingCycle("yearly")}
                        className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all cursor-pointer ${
                            billingCycle === "yearly"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <span>Facturación Anual</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            billingCycle === "yearly" ? "bg-amber-400 text-gray-950" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}>
                            -17% (2 meses gratis)
                        </span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {/* Free Plan */}
                <Card className={`flex flex-col justify-between ${currentPlan === "free" ? "border-primary border-2 shadow-sm" : "opacity-80"}`}>
                    <div>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-xl">
                                <span className="flex items-center gap-2">
                                    <CheckCircle className="text-muted-foreground h-5 w-5" /> Plan Inicial
                                </span>
                                {currentPlan === "free" && <Badge variant="secondary">Activo</Badge>}
                            </CardTitle>
                            <CardDescription>Para evaluación académica y litigio individual inicial.</CardDescription>
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
                    </div>
                    <CardFooter>
                        {currentPlan === "free" ? (
                            <Button variant="outline" disabled className="w-full">
                                Plan Activo Actual
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={handleManageSubscription}
                                disabled={isLoading || !isOwner}
                                className="w-full cursor-pointer"
                            >
                                Gestionar en Portal
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Solo Plan */}
                <Card className={`flex flex-col justify-between ${currentPlan === "solo" ? "border-emerald-500 border-2 shadow-md bg-emerald-50/10" : "border-slate-200"}`}>
                    <div>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-xl">
                                <span className="flex items-center gap-2">
                                    <Star className="text-amber-500 h-5 w-5" /> Abogado Independiente
                                </span>
                                {currentPlan === "solo" && <Badge className="bg-emerald-600 text-white">Activo</Badge>}
                            </CardTitle>
                            <CardDescription>Expedientes y clientes ilimitados para el abogado litigante.</CardDescription>
                            <div className="mt-2">
                                <p className="text-3xl font-bold">
                                    {billingCycle === "yearly" ? "$3,990" : "$399"}{" "}
                                    <span className="text-base font-normal text-muted-foreground">
                                        {billingCycle === "yearly" ? "MXN / año" : "MXN / mes"}
                                    </span>
                                </p>
                                {billingCycle === "yearly" && (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                        $332.50 MXN / mes (Ahorras $798 al año)
                                    </p>
                                )}
                            </div>
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
                    </div>
                    <CardFooter>
                        {!isOwner ? (
                            <Button variant="outline" disabled className="w-full">
                                Solo el titular puede modificar el plan
                            </Button>
                        ) : currentPlan === "solo" ? (
                            <Button onClick={handleManageSubscription} disabled={isLoading} className="w-full cursor-pointer">
                                {isLoading ? "Cargando..." : "Administrar Suscripción"}
                            </Button>
                        ) : currentPlan === "firm" ? (
                            <Button variant="outline" onClick={handleManageSubscription} disabled={isLoading} className="w-full cursor-pointer">
                                {isLoading ? "Cargando..." : "Gestionar en Portal"}
                            </Button>
                        ) : (
                            <Button onClick={() => handleUpgrade("solo")} disabled={isLoading} className="w-full cursor-pointer">
                                {isLoading ? "Conectando..." : "Elegir Plan Abogado"}
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Firm Plan */}
                <Card className={`relative flex flex-col justify-between ${currentPlan === "firm" ? "border-emerald-500 border-2 shadow-md bg-emerald-50/10" : "border-primary/50 shadow-sm hover:shadow-md transition-shadow"}`}>
                    <div className="absolute -top-3.5 right-6">
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2.5 py-0.5 shadow-sm text-xs">
                            Despacho & Equipo
                        </Badge>
                    </div>
                    <div>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-xl">
                                <span className="flex items-center gap-2">
                                    <Users className="text-primary h-5 w-5" /> Despacho Jurídico
                                </span>
                                {currentPlan === "firm" && <Badge className="bg-emerald-600 text-white">Activo</Badge>}
                            </CardTitle>
                            <CardDescription>Para despachos de hasta 5 abogados con roles y auditoría procesal.</CardDescription>
                            <div className="mt-2">
                                <p className="text-3xl font-bold">
                                    {billingCycle === "yearly" ? "$8,990" : "$899"}{" "}
                                    <span className="text-base font-normal text-muted-foreground">
                                        {billingCycle === "yearly" ? "MXN / año" : "MXN / mes"}
                                    </span>
                                </p>
                                {billingCycle === "yearly" && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                                        $749.16 MXN / mes (Ahorras $1,798 al año)
                                    </p>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {planFeatures.firm.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </div>
                    <CardFooter>
                        {!isOwner ? (
                            <Button variant="outline" disabled className="w-full">
                                Solo el titular puede modificar el plan
                            </Button>
                        ) : currentPlan === "firm" ? (
                            <Button onClick={handleManageSubscription} disabled={isLoading} className="w-full cursor-pointer">
                                {isLoading ? "Cargando..." : "Administrar Suscripción"}
                            </Button>
                        ) : currentPlan === "solo" ? (
                            <Button onClick={() => handleUpgrade("firm")} disabled={isLoading} className="w-full cursor-pointer bg-primary text-white hover:bg-primary/90">
                                {isLoading ? "Conectando..." : "Mejorar a Plan Despacho"}
                            </Button>
                        ) : (
                            <Button onClick={() => handleUpgrade("firm")} disabled={isLoading} className="w-full cursor-pointer bg-primary text-white hover:bg-primary/90">
                                {isLoading ? "Conectando..." : "Contratar Plan Despacho"}
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
