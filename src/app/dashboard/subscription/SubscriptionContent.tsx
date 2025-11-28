"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/app/store/Store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    popular?: boolean;
    buttonText: string;
}

const PLANS: Plan[] = [
    {
        id: 'free',
        name: 'Básico',
        price: 0,
        description: 'Para abogados independientes',
        features: [
            'Hasta 5 clientes',
            'Hasta 10 casos',
            'Calendario básico',
            'Soporte por email',
        ],
        buttonText: 'Plan actual',
    },
    {
        id: 'professional',
        name: 'Profesional',
        price: 29,
        description: 'Para pequeños bufetes',
        features: [
            'Clientes ilimitados',
            'Casos ilimitados',
            'Calendario avanzado',
            'Facturación automática',
            'Reportes personalizados',
            'Soporte prioritario',
        ],
        popular: true,
        buttonText: 'Actualizar a Profesional',
    },
    {
        id: 'enterprise',
        name: 'Empresarial',
        price: 99,
        description: 'Para grandes bufetes',
        features: [
            'Todo de Profesional',
            'Usuarios ilimitados',
            'API personalizada',
            'Integraciones avanzadas',
            'Soporte dedicado',
            'Capacitación personalizada',
        ],
        buttonText: 'Contactar ventas',
    },
];

export default function SubscriptionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, userValid, url } = useAuthStore();
    const [currentPlan, setCurrentPlan] = useState<string>('free');
    const [loading, setLoading] = useState(false);
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);

    useEffect(() => {
        const paymentStatus = searchParams.get('payment');

        if (paymentStatus === 'success') {
            toast.success('¡Pago exitoso!', {
                description: 'Tu plan ha sido actualizado a Profesional. ¡Bienvenido!',
            });
            userValid();
            router.replace('/dashboard/subscription');
        } else if (paymentStatus === 'cancelled') {
            toast.error('Pago cancelado', {
                description: 'El pago ha sido cancelado. Intenta de nuevo si deseas.',
            });
            router.replace('/dashboard/subscription');
        }
    }, [searchParams, router, userValid]);

    useEffect(() => {
        if (user?.subscription_plan) {
            setCurrentPlan(user.subscription_plan);
        }
    }, [user]);

    const handleUpgradePlan = async (planId: string) => {
        if (planId === currentPlan) {
            toast.info('Ya tienes este plan activo');
            return;
        }

        if (planId === 'enterprise') {
            window.location.href = 'mailto:ventas@abogados.com?subject=Plan Empresarial';
            return;
        }

        try {
            setProcessingPlan(planId);
            setLoading(true);

            const response = await fetch(`${url}/api/subscription/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    plan_id: planId,
                    user_id: user?.id,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al procesar el pago');
            }

            const { checkout_url } = await response.json();

            if (checkout_url) {
                window.location.href = checkout_url;
            }
        } catch (error) {
            console.error('Error upgrading plan:', error);
            toast.error('Error al procesar el pago', {
                description: 'Intenta de nuevo más tarde',
            });
        } finally {
            setLoading(false);
            setProcessingPlan(null);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-bold mb-2">Planes de Suscripción</h1>
                <p className="text-muted-foreground text-lg">
                    Elige el plan perfecto para tu práctica legal
                </p>
            </div>

            {/* Current Plan Info */}
            <Card className="mb-8 bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle>Plan Actual</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">
                        Estás en el plan{' '}
                        <span className="font-bold capitalize">
                            {PLANS.find(p => p.id === currentPlan)?.name || 'Desconocido'}
                        </span>
                    </p>
                </CardContent>
            </Card>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {PLANS.map((plan) => (
                    <Card
                        key={plan.id}
                        className={`relative flex flex-col transition-all duration-300 ${
                            plan.popular
                                ? 'lg:scale-105 border-2 border-primary shadow-lg'
                                : 'hover:shadow-md'
                        } ${currentPlan === plan.id ? 'ring-2 ring-green-500' : ''}`}
                    >
                        {/* Popular Badge */}
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <Badge className="bg-primary text-white px-3 py-1">
                                    Más Popular
                                </Badge>
                            </div>
                        )}

                        {/* Current Plan Badge */}
                        {currentPlan === plan.id && (
                            <div className="absolute -top-4 right-4">
                                <Badge className="bg-green-500 text-white px-3 py-1">
                                    Plan Actual
                                </Badge>
                            </div>
                        )}

                        <CardHeader className={plan.popular ? 'pt-8' : ''}>
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">
                                    ${plan.price}
                                </span>
                                {plan.price > 0 && (
                                    <span className="text-muted-foreground ml-2">/mes</span>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="flex-grow">
                            <ul className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter>
                            <Button
                                onClick={() => handleUpgradePlan(plan.id)}
                                disabled={loading && processingPlan === plan.id}
                                className="w-full"
                                variant={
                                    currentPlan === plan.id
                                        ? 'outline'
                                        : plan.popular
                                        ? 'default'
                                        : 'outline'
                                }
                            >
                                {loading && processingPlan === plan.id ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    plan.buttonText
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold mb-8">Preguntas Frecuentes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">¿Puedo cambiar de plan?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Sí, puedes cambiar de plan en cualquier momento. Los cambios se aplican de inmediato.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">¿Hay contrato a largo plazo?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                No, todos nuestros planes son mensuales sin compromisos a largo plazo.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">¿Qué pasa si cancelo?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Puedes cancelar en cualquier momento. Tu acceso continuará hasta fin de mes.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">¿Hay soporte técnico?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Sí, todos los planes incluyen soporte. Los planes superiores tienen soporte prioritario.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
