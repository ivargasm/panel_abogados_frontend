"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/store/Store';
import { getMyCases } from '@/app/lib/api';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { CaseSummary } from '@/app/types';
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from 'lucide-react';

const statusConfig: { [key: string]: { label: string; className: string } } = {
    "active": { label: "Activo", className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100" },
    "on_hold": { label: "En Espera", className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100" },
    "pending_review": { label: "Pendiente de Revisión", className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100" },
    "closed": { label: "Cerrado", className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100" },
};

const CaseCardSkeleton = () => (
    <Card className="h-full">
        <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-2" />
            <Skeleton className="h-10 w-32 mt-4" />
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

    const getClientName = () => {
        if (cases.length > 0 && cases[0]?.client?.full_name) {
            return cases[0].client.full_name;
        }
        return 'Cliente';
    };

    return (
        <ProtectedRoute allowedRoles={['client']}>
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Bienvenido/a, {getClientName()}!
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Aquí tienes una vista general de tus casos activos.
                        </p>
                    </header>

                    {/* Grid responsivo para las tarjetas de casos */}
                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            <CaseCardSkeleton />
                            <CaseCardSkeleton />
                        </div>
                    ) : cases.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {cases.map((caseItem) => (
                                <Card key={caseItem.id} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl font-semibold text-gray-900">
                                                    {caseItem.title}
                                                </CardTitle>
                                                {caseItem.case_number && (
                                                    <CardDescription className="text-sm text-gray-600 mt-1">
                                                        Caso #: {caseItem.case_number}
                                                    </CardDescription>
                                                )}
                                            </div>
                                            <Badge 
                                                variant="outline" 
                                                className={`text-xs font-medium px-3 py-1 ${
                                                    statusConfig[caseItem.status]?.className || 
                                                    "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100"
                                                }`}
                                            >
                                                {statusConfig[caseItem.status]?.label || caseItem.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {caseItem.assigned_lawyer && (
                                            <div className="text-sm">
                                                <span className="text-gray-600">Abogado Asignado:</span>
                                                <span className="ml-2 text-gray-900 font-medium">
                                                    {caseItem.assigned_lawyer.full_name}
                                                </span>
                                            </div>
                                        )}
                                        <Link href={`/portal-cliente/casos/${caseItem.id}`}>
                                            <Button 
                                                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium"
                                            >
                                                Ver Detalles
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No tienes casos asignados</h3>
                            <p className="mt-1 text-sm text-gray-600">Cuando tu abogado te asigne a un caso, aparecerá aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}