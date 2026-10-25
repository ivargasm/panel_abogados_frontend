"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, RefreshCw, LogOut } from "lucide-react";
import { getSessionStatus, refreshSession } from "@/app/lib/api";

const WARNING_THRESHOLD_SECONDS = 300; // 5 minutos antes de expirar

export default function SessionExpiryWatcher() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshSuccess, setRefreshSuccess] = useState(false);
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleLogout = useCallback(() => {
        setIsOpen(false);
        router.push("/auth/login?session_expired=true");
    }, [router]);

    const handleContinue = async () => {
        setIsRefreshing(true);
        try {
            await refreshSession();
            setRefreshSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                setRefreshSuccess(false);
                setIsRefreshing(false);
            }, 600);
            // Volver a consultar estatus de sesión para actualizar timer
            const status = await getSessionStatus();
            if (status.authenticated && typeof status.remaining_seconds === "number") {
                setSecondsLeft(status.remaining_seconds);
            }
        } catch (err) {
            console.error("Error al renovar sesión:", err);
            handleLogout();
        } finally {
            setIsRefreshing(false);
        }
    };

    const checkStatus = useCallback(async () => {
        try {
            const status = await getSessionStatus();
            if (!status.authenticated) {
                return;
            }

            const rem = status.remaining_seconds;
            setSecondsLeft(rem);

            if (rem <= 0) {
                handleLogout();
            } else if (rem <= WARNING_THRESHOLD_SECONDS) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        } catch {
            // Ignorar errores transitorios de red
        }
    }, [handleLogout]);

    useEffect(() => {
        checkStatus();
        // Verificar cada 45 segundos contra el backend
        checkIntervalRef.current = setInterval(checkStatus, 45000);
        return () => {
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        };
    }, [checkStatus]);

    // Timer de cuenta regresiva en segundos cuando el modal está abierto
    useEffect(() => {
        if (!isOpen || secondsLeft === null) return;

        countdownIntervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev === null || prev <= 1) {
                    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                    handleLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, handleLogout]);

    if (!isOpen || secondsLeft === null) return null;

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-900 dark:text-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
                        <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight">Tu sesión está por expirar</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Protección de secreto profesional</p>
                    </div>
                </div>

                <div className="p-4 my-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-center">
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">
                        Tiempo restante para cierre automático:
                    </p>
                    <span className="text-3xl font-bold font-mono tracking-wider text-amber-600 dark:text-amber-400">
                        {formattedTime}
                    </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Por seguridad y confidencialidad jurídica, tu sesión se cerrará automáticamente si no continúas activo.
                    ¿Deseas renovar tu sesión para seguir trabajando?
                </p>

                <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isRefreshing}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                    </button>
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isRefreshing}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        {refreshSuccess ? "¡Sesión renovada!" : isRefreshing ? "Renovando..." : "Continuar trabajando"}
                    </button>
                </div>
            </div>
        </div>
    );
}
