"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, RefreshCw, X, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    inviteClient,
    resendClientInvitation,
    cancelInvitation,
    getClientInvitationStatus
} from '@/app/lib/invitations-api';

interface InvitationButtonProps {
    clientId: number;
    clientEmail?: string;
}

interface InvitationStatus {
    status: 'none' | 'not_invited' | 'pending' | 'sent' | 'accepted' | 'cancelled';
    invitation?: {
        id: number;
        email: string;
        created_at: string;
        expires_at: string;
        accepted_at?: string;
    };
}

export function InvitationButton({ clientId, clientEmail }: InvitationButtonProps) {
    const [invitationStatus, setInvitationStatus] = useState<InvitationStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        loadInvitationStatus();
    }, [clientId]);

    async function loadInvitationStatus() {
        try {
            const status = await getClientInvitationStatus(clientId);
            setInvitationStatus(status);
        } catch (error) {
            console.error('Error loading invitation status:', error);
        } finally {
            setInitialLoading(false);
        }
    }

    async function handleInvite() {
        if (!clientEmail) {
            toast.error('El cliente no tiene un email configurado');
            return;
        }

        setLoading(true);
        try {
            await inviteClient(clientId);
            toast.success('Invitación enviada exitosamente');
            loadInvitationStatus();
        } catch (error: any) {
            toast.error(error.message || 'Error al enviar invitación');
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        setLoading(true);
        try {
            await resendClientInvitation(clientId);
            toast.success('Invitación reenviada exitosamente');
            loadInvitationStatus();
        } catch (error: any) {
            toast.error(error.message || 'Error al reenviar invitación');
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel() {
        if (!confirm('¿Estás seguro de cancelar esta invitación?')) return;

        if (!invitationStatus?.invitation?.id) return;

        setLoading(true);
        try {
            await cancelInvitation(invitationStatus.invitation.id);
            toast.success('Invitación cancelada');
            loadInvitationStatus();
        } catch (error: any) {
            toast.error(error.message || 'Error al cancelar invitación');
        } finally {
            setLoading(false);
        }
    }

    if (initialLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando...
            </div>
        );
    }

    if (!invitationStatus) return null;

    // Sin invitación
    if (invitationStatus.status === 'none' || invitationStatus.status === 'not_invited') {
        return (
            <Button
                onClick={handleInvite}
                disabled={loading || !clientEmail}
                size="sm"
                variant="outline"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    <Mail className="h-4 w-4 mr-2" />
                )}
                Invitar al Portal
            </Button>
        );
    }

    // Invitación enviada/pendiente
    if (invitationStatus.status === 'sent' || invitationStatus.status === 'pending') {
        return (
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Mail className="h-3 w-3 mr-1" />
                    Invitación Enviada
                </Badge>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResend}
                    disabled={loading}
                    className="h-8"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reenviar
                        </>
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={loading}
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                        </>
                    )}
                </Button>
            </div>
        );
    }

    // Invitación aceptada
    if (invitationStatus.status === 'accepted') {
        return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Portal Activo
            </Badge>
        );
    }

    // Invitación cancelada
    if (invitationStatus.status === 'cancelled') {
        return (
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    Invitación Cancelada
                </Badge>
                <Button
                    onClick={handleInvite}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Mail className="h-4 w-4 mr-2" />
                    )}
                    Enviar Nueva
                </Button>
            </div>
        );
    }

    return null;
}
