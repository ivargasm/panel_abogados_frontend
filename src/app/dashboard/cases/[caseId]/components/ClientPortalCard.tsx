// app/dashboard/cases/[caseId]/components/ClientPortalCard.tsx
// Componente dedicado para gestionar la invitación al portal del cliente.

"use client";

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useAuthStore } from '@/app/store/Store';
import { inviteClient } from '@/app/lib/api';
import type { Case, ClientInviteData } from '@/app/types';

export default function ClientPortalCard({ caseDetails }: { caseDetails: Case }) {
    const [email, setEmail] = useState(caseDetails.client.email || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { url } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Por favor, introduce un email válido.");
            return;
        }
        setIsSubmitting(true);
        try {
            const inviteData: ClientInviteData = {
                email,
                case_title: caseDetails.title,
                client_name: caseDetails.client.full_name,
            };
            const response = await inviteClient(caseDetails.id, inviteData, url);
            toast.success(response.message || "Invitación enviada con éxito.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo enviar la invitación.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Portal del Cliente</CardTitle>
                <CardDescription>
                    Invita a tu cliente a ver los avances de su caso.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="client-email">Email del Cliente</Label>
                        <Input
                            id="client-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Enviando..." : "Enviar Invitación"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
