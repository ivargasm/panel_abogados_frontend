"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/store/Store';
import { getMyCases } from '@/app/lib/api';
import ProtectedRoute from '@/app/components/ProtectedRoutes'; // Reutilizamos tu componente!
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { CaseSummary } from '@/app/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, FileText } from 'lucide-react';

// Mapeo de estatus a colores para los badges
const statusClasses: { [key: string]: string } = {
    "active": "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
    "on_hold": "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
    "closed": "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
};
const defaultStatusClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700";

// --- Componente de Esqueleto de Carga ---
const CaseCardSkeleton = () => (
    <Card className="h-full">
        <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-2" />
        </CardContent>
    </Card>
);



export default function ClientPortalPage() {
    const { url } = useAuthStore();
    const [cases, setCases] = useState<CaseSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                setLoading(true);
                const data = await getMyCases(url);
                setCases(data);
            } catch (err) {
                console.log(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
            } finally {
                setLoading(false);
            }
        };
        
        fetchCases();
    }, [url]);

    return (
        <ProtectedRoute allowedRoles={['client']}>
            {/* Contenedor principal con fondo y padding mejorados */}
            <div className="bg-slate-50 dark:bg-slate-900/50 min-h-screen w-full md:w-3/4 m-auto mt-14">
                <div className="container mx-auto p-4 sm:p-6 md:p-8">
                    {/* Cabecera más atractiva con ícono y descripción */}
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Bienvenido a tu Portal</h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">
                            Hola <span className="font-semibold">{cases[0]?.client?.full_name}</span>, aquí puedes consultar el estado de tus casos.
                        </p>
                    </header>

                    {/* Grid responsivo para las tarjetas de casos */}
                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <CaseCardSkeleton />
                            <CaseCardSkeleton />
                            <CaseCardSkeleton />
                        </div>
                    ) : cases.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {cases.map((caseItem) => (
                                <Link href={`/portal-cliente/casos/${caseItem.id}`} key={caseItem.id} className="block group">
                                    {/* Tarjeta de Caso Rediseñada */}
                                    <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:border-primary dark:border-slate-700">
                                        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                                <Briefcase className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg text-slate-800 dark:text-slate-200">{caseItem.title}</CardTitle>
                                                {caseItem.case_number && <CardDescription>Expediente: {caseItem.case_number}</CardDescription>}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                                {caseItem.description || "Haz clic para ver los detalles y avances del caso."}
                                            </p>
                                        </CardContent>
                                        <div className="p-6 pt-0">
                                            <Badge className={`border text-xs font-semibold ${statusClasses[caseItem.status] || defaultStatusClass}`}>
                                                {caseItem.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Badge>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        // Mensaje claro cuando no hay casos
                        <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
                            <FileText className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">No tienes casos asignados</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Cuando tu abogado te asigne a un caso, aparecerá aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}