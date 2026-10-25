"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/app/store/Store";
import { API_URL, getMyCases } from "@/app/lib/api";
import ProtectedRoute from "@/app/components/ProtectedRoutes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CaseSummary } from "@/app/types";
import { FileText, Scale, LogOut, Sun, Moon, Building2, Award, ArrowRight } from "lucide-react";
import { getCaseStatusLabel, getCaseStatusStyle } from "@/lib/legal-domain";

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
    const { user, logout } = useAuthStore();
    const [cases, setCases] = useState<CaseSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                setLoading(true);
                const data = await getMyCases(API_URL);
                setCases(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, []);

    const getClientName = () => {
        if (cases.length > 0 && cases[0]?.client?.full_name) {
            return cases[0].client.full_name;
        }
        return user?.full_name || "Representado";
    };

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle("dark");
    };

    return (
        <ProtectedRoute allowedRoles={["client"]}>
            <div className="bg-secondary/30 dark:bg-background min-h-screen flex flex-col">
                {/* Barra superior del Portal del Cliente */}
                <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur print:hidden">
                    <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Scale className="h-5 w-5 text-primary shrink-0" />
                            <div className="truncate">
                                <span className="font-bold text-sm sm:text-base text-foreground">
                                    {user?.workspace_name || "Portal Jurídico del Cliente"}
                                </span>
                                <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
                                    • Consulta Confidencial de Expedientes
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Cambiar tema">
                                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={logout}>
                                <LogOut className="h-4 w-4 mr-1.5" />
                                Salir
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl flex-1">
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                            Bienvenido/a, {getClientName()}
                        </h1>
                        <p className="text-muted-foreground mt-1.5">
                            Consulta en tiempo real el estado procesal, acuerdos compartidos, audiencias y honorarios de tus asuntos legales.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            <CaseCardSkeleton />
                            <CaseCardSkeleton />
                        </div>
                    ) : cases.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {cases.map((caseItem) => (
                                <Card
                                    key={caseItem.id}
                                    className="flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {caseItem.legal_matter && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Materia {caseItem.legal_matter}
                                                    </Badge>
                                                )}
                                                {caseItem.judicial_file_number && (
                                                    <Badge variant="outline" className="text-xs font-mono">
                                                        Exp. {caseItem.judicial_file_number}
                                                    </Badge>
                                                )}
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs font-medium ${getCaseStatusStyle(
                                                    caseItem.status
                                                )}`}
                                            >
                                                {getCaseStatusLabel(caseItem.status)}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl font-semibold">
                                            {caseItem.title}
                                        </CardTitle>
                                        {caseItem.court_name && (
                                            <CardDescription className="flex items-center gap-1.5 mt-1">
                                                <Building2 className="h-3.5 w-3.5 shrink-0" />
                                                <span>{caseItem.court_name}</span>
                                            </CardDescription>
                                        )}
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {caseItem.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {caseItem.description}
                                            </p>
                                        )}

                                        {caseItem.assigned_lawyer && (
                                            <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-0.5">
                                                <span className="text-muted-foreground block">
                                                    Abogado Titular / Responsable:
                                                </span>
                                                <span className="font-semibold text-sm text-foreground block">
                                                    {caseItem.assigned_lawyer.full_name}
                                                </span>
                                                {caseItem.assigned_lawyer.professional_license && (
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <Award className="h-3 w-3" />
                                                        Cédula Profesional: {caseItem.assigned_lawyer.professional_license}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <Button asChild className="w-full">
                                            <Link href={`/portal-cliente/casos/${caseItem.id}`}>
                                                Consultar Expediente y Avances
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-16 px-6 border-dashed">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-40" />
                            <h3 className="mt-4 text-lg font-semibold">
                                Sin expedientes activos vinculados
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Cuando tu abogado radique un asunto a tu nombre, podrás darle seguimiento desde este portal.
                            </p>
                        </Card>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
