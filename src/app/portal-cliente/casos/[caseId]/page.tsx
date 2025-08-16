"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/app/store/Store';
import { getMyCaseDetails } from '@/app/lib/api';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarCheck, User } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import type { ClientCaseDetail, CaseUpdate } from '@/app/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Mapeo de estatus a clases de Tailwind para los badges
const statusClasses: { [key: string]: string } = {
    "Completado": "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
    "En Proceso": "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700",
    "Pendiente":  "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
    "Cancelado":  "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
};
const defaultStatusClass = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";

// --- Componente de Esqueleto de Carga Mejorado ---
const DetailPageSkeleton = () => (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <Skeleton className="h-8 w-40 mb-8" />
        <Card className="mb-8">
            <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6 mt-2" />
            </CardContent>
        </Card>
        <Skeleton className="h-7 w-64 mb-6" />
        <div className="space-y-8">
            <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        </div>
    </div>
);


// --- Componente de la Línea de Tiempo Rediseñado ---
const TimelineItem = ({ update, isLast }: { update: CaseUpdate, isLast: boolean }) => {
    return (
        <div className="relative flex items-start gap-x-5">
            {/* Línea vertical de conexión */}
            {!isLast && <div className="absolute left-5 top-5 -bottom-5 w-px bg-slate-200 dark:bg-slate-700" />}
            
            {/* Ícono del evento */}
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>

            {/* Contenido del evento */}
            <div className="flex-grow pt-1">
                <div className="flex items-center gap-x-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{update.created_by.full_name}</p>
                    <Badge className={`border text-xs font-semibold ${statusClasses[update.status] || defaultStatusClass}`}>
                        {update.status}
                    </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{update.update_text}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {format(new Date(update.created_at), "d 'de' LLLL 'de' yyyy, h:mm a", { locale: es })}
                </p>
            </div>
        </div>
    );
};

// --- Componente Principal de la Página Rediseñada ---
export default function CaseDetailPage() {
    const params = useParams();
    const { url } = useAuthStore();
    const caseId = params.caseId as string;

    const [caseDetails, setCaseDetails] = useState<ClientCaseDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (caseId) {
            const fetchDetails = async () => {
                try {
                    setLoading(true);
                    const data = await getMyCaseDetails(caseId, url);
                    setCaseDetails(data);
                } catch (err) {
                    console.error("Error fetching case details:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [caseId, url]);

    if (loading) {
        return <div className="bg-slate-50 dark:bg-slate-900/50 min-h-screen w-full"><DetailPageSkeleton /></div>;
    }

    if (!caseDetails) {
        return <div className="flex h-screen items-center justify-center text-center">No se encontraron los datos del caso.</div>;
    }

    return (
        <ProtectedRoute allowedRoles={['client']}>
            <div className="bg-slate-50 dark:bg-slate-900/50 min-h-screen w-full mt-14">
                <div className="container mx-auto max-w-4xl p-4 md:p-8">
                    <Button asChild variant="ghost" className="mb-6 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <Link href="/portal-cliente">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a mis casos
                        </Link>
                    </Button>

                    <Card className="mb-10 overflow-hidden border dark:border-slate-700 shadow-sm">
                        <CardHeader className="bg-slate-100/50 dark:bg-slate-800/50 p-6">
                            <Badge variant="secondary" className="w-fit mb-2">{caseDetails.status.replace('_', ' ').toUpperCase()}</Badge>
                            <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">{caseDetails.title}</CardTitle>
                            {caseDetails.case_number && <CardDescription>Expediente: {caseDetails.case_number}</CardDescription>}
                        </CardHeader>
                        {caseDetails.description && (
                            <CardContent className="p-6 text-slate-700 dark:text-slate-300">
                                <p>{caseDetails.description}</p>
                            </CardContent>
                        )}
                    </Card>

                    <div>
                        <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200">Línea de Tiempo y Avances</h2>
                        {caseDetails.updates.length > 0 ? (
                            <div className="space-y-8">
                                {caseDetails.updates.map((update, index) => (
                                    <TimelineItem 
                                        key={update.id} 
                                        update={update}
                                        isLast={index === caseDetails.updates.length - 1}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg dark:border-slate-700">
                                <CalendarCheck className="mx-auto h-12 w-12 text-slate-400" />
                                <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">Sin avances por ahora</h3>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tu abogado registrará aquí todas las novedades del caso.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
