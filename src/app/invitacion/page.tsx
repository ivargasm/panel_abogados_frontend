// app/invitacion/page.tsx
// Página pública para que los clientes acepten su invitación y creen su cuenta.

"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase } from 'lucide-react';

// Lógica de negocio y tipos
import { useAuthStore } from '@/app/store/Store';
import { getInvitationDetails, acceptInvitation } from '@/app/lib/api';
import type { InvitationDetails, AcceptInvitationData } from '@/app/types';

function InvitationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const { url } = useAuthStore();

    const [details, setDetails] = useState<InvitationDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        password: '',
        confirm_password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("No se proporcionó un token de invitación.");
            setIsLoading(false);
            return;
        }

        const verifyToken = async () => {
            try {
                const data = await getInvitationDetails(token, url);
                setDetails(data);
                setFormData(prev => ({ ...prev, full_name: data.client_name }));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error al verificar la invitación.");
            } finally {
                setIsLoading(false);
            }
        };
        verifyToken();
    }, [token, url]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }
        if (!token) return;

        setIsSubmitting(true);
        try {
            const payload: AcceptInvitationData = {
                token,
                password: formData.password,
                full_name: formData.full_name,
            };
            const response = await acceptInvitation(payload, url);
            toast.success(response.message || "¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
            router.push('/auth/login');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <Card className="w-full max-w-md"><CardHeader><CardTitle>Verificando invitación...</CardTitle></CardHeader><CardContent>Por favor, espera.</CardContent></Card>;
    }

    if (error) {
        return <Card className="w-full max-w-md"><CardHeader><CardTitle className="text-destructive">Error en la Invitación</CardTitle></CardHeader><CardContent><p>{error}</p><Button asChild className="mt-4 w-full"><Link href="/auth/login">Volver al Inicio</Link></Button></CardContent></Card>;
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                    <Briefcase className="h-6 w-6" />
                </div>
                <CardTitle>¡Bienvenido a LexControl!</CardTitle>
                <CardDescription>
                    Estás invitado a ver el caso: <span className="font-semibold text-foreground">{details?.case_title}</span>.
                    Crea tu cuenta para acceder al portal.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="full_name">Tu Nombre Completo</Label>
                        <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} required />
                    </div>
                     <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={details?.email} disabled />
                    </div>
                    <div>
                        <Label htmlFor="password">Crea una Contraseña</Label>
                        <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <Label htmlFor="confirm_password">Confirma tu Contraseña</Label>
                        <Input id="confirm_password" name="confirm_password" type="password" value={formData.confirm_password} onChange={handleInputChange} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Creando cuenta..." : "Crear Cuenta y Aceptar Invitación"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

// Usamos Suspense para que useSearchParams funcione correctamente en el App Router
export default function InvitationPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Suspense fallback={<div>Cargando...</div>}>
                <InvitationContent />
            </Suspense>
        </div>
    );
}
