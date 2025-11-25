"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/store/Store';
import { getMyCases } from '@/app/lib/api';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { CaseSummary } from '@/app/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, FileText } from 'lucide-react';

const statusClasses: { [key: string]: string } = {
    "active": "bg-success/10 text-success border-success/20",
    "on_hold": "bg-warning/10 text-warning border-warning/20",
    "closed": "bg-muted text-muted-foreground border-border",
};
const defaultStatusClass = "bg-primary/10 text-primary border-primary/20";

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
            <div className="bg-muted/30 min-h-screen w-full md:w-3/4 m-auto">
                <div className="container mx-auto p-4 sm:p-6 md:p-8">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Bienvenido a tu Portal</h1>
                        <p className="text-lg text-muted-foreground mt-1">
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
                                    <Card className="h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:border-primary">
                                        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                                <Briefcase className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                                                {caseItem.case_number && <CardDescription>Expediente: {caseItem.case_number}</CardDescription>}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
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
                        <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium text-foreground">No tienes casos asignados</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Cuando tu abogado te asigne a un caso, aparecerá aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}