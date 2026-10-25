"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, RefreshCw, X, CheckCircle, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import {
    inviteClient,
    resendClientInvitation,
    cancelInvitation,
    getClientInvitationStatus,
} from "@/app/lib/invitations-api";

interface InvitationButtonProps {
    clientId: number;
    clientEmail?: string;
}

interface InvitationStatus {
    status: "none" | "not_invited" | "pending" | "sent" | "accepted" | "cancelled" | "expired";
    invitation?: {
        id: number;
        email: string;
        expires_at: string;
        token?: string | null;
    } | null;
}

export function InvitationButton({ clientId, clientEmail }: InvitationButtonProps) {
    const [invitationStatus, setInvitationStatus] = useState<InvitationStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const loadInvitationStatus = useCallback(async () => {
        try {
            const status = await getClientInvitationStatus(clientId);
            setInvitationStatus(status);
        } catch (error) {
            console.error("Error loading invitation status:", error);
        } finally {
            setInitialLoading(false);
        }
    }, [clientId]);

    useEffect(() => {
        setInitialLoading(true);
        loadInvitationStatus();
    }, [clientId, loadInvitationStatus]);

    async function handleInvite() {
        if (!clientEmail) {
            toast.error("Registra primero un correo electrónico para este cliente");
            return;
        }

        setLoading(true);
        try {
            await inviteClient(clientId);
            toast.success("Invitación generada y enviada al cliente");
            loadInvitationStatus();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al enviar invitación");
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        setLoading(true);
        try {
            await resendClientInvitation(clientId);
            toast.success("Invitación renovada y reenviada");
            loadInvitationStatus();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al reenviar invitación");
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel() {
        if (!invitationStatus?.invitation?.id) return;

        setLoading(true);
        try {
            await cancelInvitation(invitationStatus.invitation.id);
            toast.success("Invitación cancelada");
            loadInvitationStatus();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al cancelar invitación");
        } finally {
            setLoading(false);
        }
    }

    function handleCopyLink() {
        const token = invitationStatus?.invitation?.token;
        if (!token) return;
        const link = `${window.location.origin}/invitacion?token=${token}`;
        navigator.clipboard.writeText(link);
        toast.success("Enlace de activación copiado al portapapeles");
    }

    if (initialLoading) {
        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Verificando portal...
            </div>
        );
    }

    if (!invitationStatus) return null;

    if (
        invitationStatus.status === "none" ||
        invitationStatus.status === "not_invited" ||
        invitationStatus.status === "cancelled" ||
        invitationStatus.status === "expired"
    ) {
        return (
            <div className="flex flex-wrap items-center gap-2">
                {invitationStatus.status === "expired" && (
                    <Badge variant="outline" className="text-amber-700 border-amber-300 dark:text-amber-300">
                        Invitación expirada
                    </Badge>
                )}
                <Button
                    onClick={handleInvite}
                    disabled={loading || !clientEmail}
                    size="sm"
                    variant="outline"
                    title={!clientEmail ? "Agrega un correo electrónico al cliente para habilitar su portal" : undefined}
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Mail className="h-4 w-4 mr-2" />
                    )}
                    Habilitar Portal del Cliente
                </Button>
            </div>
        );
    }

    if (invitationStatus.status === "sent" || invitationStatus.status === "pending") {
        return (
            <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800">
                    <Mail className="h-3 w-3 mr-1" />
                    Invitación Pendiente
                </Badge>
                {invitationStatus.invitation?.token && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyLink}
                        className="h-7 px-2 text-xs"
                        title="Copiar enlace directo de activación"
                    >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar enlace
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResend}
                    disabled={loading}
                    className="h-7 px-2 text-xs"
                >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reenviar
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={loading}
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                >
                    <X className="h-3 w-3 mr-1" />
                    Cancelar
                </Button>
            </div>
        );
    }

    if (invitationStatus.status === "accepted") {
        return (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Portal del Cliente Activo
            </Badge>
        );
    }

    return null;
}
