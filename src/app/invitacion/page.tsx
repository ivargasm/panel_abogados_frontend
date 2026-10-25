// app/invitacion/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuthStore } from "@/app/store/Store";
import { getInvitationDetails, acceptInvitation } from "@/app/lib/api";
import type { InvitationDetails, AcceptInvitationData } from "@/app/types";

function InvitationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { url } = useAuthStore();

    const [details, setDetails] = useState<InvitationDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        full_name: "",
        password: "",
        confirm_password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("No se proporcionó un token de invitación válido.");
            setIsLoading(false);
            return;
        }

        const verifyToken = async () => {
            try {
                const data = await getInvitationDetails(token, url);
                setDetails(data);
                setFormData((prev) => ({ ...prev, full_name: data.client_name }));
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
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres.");
            return;
        }
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
                full_name: formData.full_name.trim(),
            };
            const response = await acceptInvitation(payload, url);
            toast.success(response.message || "¡Cuenta activada con éxito! Ya puedes iniciar sesión.");
            router.push("/auth/login");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo activar la cuenta.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Verificando invitación...</CardTitle>
                </CardHeader>
                <CardContent>Validando enlace seguro del despacho, por favor espera.</CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-destructive">Enlace no disponible</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button asChild className="mt-4 w-full">
                        <Link href="/auth/login">Ir a Iniciar Sesión</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-3">
                    <Scale className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">Portal Jurídico del Cliente</CardTitle>
                <CardDescription className="pt-1 leading-relaxed">
                    Has sido invitado por{" "}
                    <span className="font-semibold text-foreground">
                        {details?.workspace_name || details?.case_title || "tu despacho jurídico"}
                    </span>{" "}
                    para consultar en línea los avances procesales, documentos autorizados y estados de cuenta de tus expedientes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input id="email" type="email" value={details?.email || ""} disabled />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="password">Contraseña (mínimo 8 caracteres)</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            minLength={8}
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
                        <Input
                            id="confirm_password"
                            name="confirm_password"
                            type="password"
                            minLength={8}
                            value={formData.confirm_password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Activando acceso..." : "Activar Acceso al Portal"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function InvitationPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Suspense fallback={<div>Cargando...</div>}>
                <InvitationContent />
            </Suspense>
        </div>
    );
}
