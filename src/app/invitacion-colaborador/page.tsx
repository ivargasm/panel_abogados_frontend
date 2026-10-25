"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    CheckCircle2,
    Eye,
    EyeOff,
    Scale,
    Shield,
    ShieldAlert,
    UserCheck,
} from "lucide-react";
import { validateTeamInvitation, acceptTeamInvitation } from "@/app/lib/api";
import type { TeamInviteValidation } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InvitacionColaboradorPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [inviteData, setInviteData] = useState<TeamInviteValidation | null>(null);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tokenParam = params.get("token");
            if (tokenParam) {
                setToken(tokenParam);
                validateToken(tokenParam);
            } else {
                setError("No se proporcionó un enlace o token de invitación válido.");
                setLoading(false);
            }
        }
    }, []);

    const validateToken = async (tok: string) => {
        setValidating(true);
        setError(null);
        try {
            const data = await validateTeamInvitation(tok);
            setInviteData(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("No se pudo validar el enlace de invitación.");
            }
        } finally {
            setLoading(false);
            setValidating(false);
        }
    };

    const handleAccept = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!token) {
            setFormError("Token de invitación ausente.");
            return;
        }

        if (password.length < 8) {
            setFormError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setFormError("Las contraseñas no coinciden.");
            return;
        }

        setSubmitting(true);
        try {
            await acceptTeamInvitation(token, password);
            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 1200);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError("Error al activar la cuenta. Inténtalo nuevamente.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                {/* Header institucional */}
                <div className="bg-slate-900 text-white p-8 text-center border-b border-slate-800">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-600/20 text-blue-400 mb-3">
                        <Scale className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">
                        {inviteData?.workspace_name || "LexControl"}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                        Incorporación al Equipo Jurídico
                    </p>
                </div>

                <div className="p-8">
                    {loading || validating ? (
                        <div className="text-center py-10 space-y-3">
                            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-sm text-slate-500">Validando enlace de invitación oficial...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-6 space-y-4">
                            <div className="p-3 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                Enlace de Invitación No Válido
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                                {error}
                            </p>
                            <div className="pt-2">
                                <Link
                                    href="/auth/login"
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Ir a Iniciar Sesión
                                </Link>
                            </div>
                        </div>
                    ) : success ? (
                        <div className="text-center py-8 space-y-4 animate-in fade-in">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                ¡Cuenta Activada Exitosamente!
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                Bienvenido a {inviteData?.workspace_name}. Redirigiendo a tu tablero de expedientes...
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Ficha de datos del colaborador */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
                                    <UserCheck className="w-4 h-4 text-blue-500" />
                                    <span>Datos de la Invitación</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Colaborador:</p>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                                            {inviteData?.full_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Puesto asignado:</p>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                                            {inviteData?.job_title || "Abogado Asociado"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Correo oficial:</p>
                                        <p className="font-mono text-xs text-slate-700 dark:text-slate-300">
                                            {inviteData?.email}
                                        </p>
                                    </div>
                                    {inviteData?.professional_license && (
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Cédula DGP:</p>
                                            <p className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                                                {inviteData.professional_license}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        Define tu Contraseña Personal
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    Por motivos de seguridad y secreto profesional, el titular del despacho no tiene acceso a tu contraseña.
                                    Ingresa una contraseña que solo tú conozcas.
                                </p>

                                <form onSubmit={handleAccept} className="space-y-4">
                                    {formError && (
                                        <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
                                            {formError}
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <Label htmlFor="password">Nueva Contraseña (mínimo 8 caracteres)</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                minLength={8}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={8}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all"
                                    >
                                        {submitting ? "Activando cuenta..." : "Activar mi cuenta y acceder al despacho"}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
