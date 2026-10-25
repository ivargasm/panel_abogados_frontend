"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, CheckCircle2, Wallet } from "lucide-react";
import InvoiceList from "@/components/billing/InvoiceList";
import CreateInvoiceModal from "@/components/billing/CreateInvoiceModal";
import { API_URL, getBillingStats } from "@/app/lib/api";
import { formatCurrencyMXN } from "@/lib/legal-domain";

export default function BillingPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [stats, setStats] = useState({
        total_billed: 0,
        total_collected: 0,
        total_due: 0,
        total_overdue: 0,
        overdue_count: 0,
        invoice_count: 0,
        collected_last_30: 0,
        payment_percentage_change: 0,
    });

    const fetchStats = useCallback(async () => {
        try {
            const data = await getBillingStats(API_URL);
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return (
        <div className="flex flex-col gap-6 w-full max-w-full overflow-x-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Honorarios y Estados de Cuenta</h1>
                    <p className="text-muted-foreground">
                        Controla igualas, anticipos, convenios de honorarios y pagos recibidos de tus clientes.
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Estado de Cuenta
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Saldo por Cobrar</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">
                            {formatCurrencyMXN(stats.total_due)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Honorarios pendientes de liquidación ({stats.invoice_count} estados de cuenta)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Vencido</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl sm:text-3xl font-bold ${stats.total_overdue > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                            {formatCurrencyMXN(stats.total_overdue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.overdue_count > 0
                                ? `${stats.overdue_count} estado(s) de cuenta con fecha vencida`
                                : "Sin honorarios vencidos a la fecha"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cobrado (Últimos 30 Días)</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">
                            {formatCurrencyMXN(stats.collected_last_30)}
                        </div>
                        <p className={`text-xs font-medium mt-1 ${stats.payment_percentage_change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                            {stats.payment_percentage_change > 0 ? "+" : ""}
                            {(stats.payment_percentage_change || 0).toFixed(1)}% vs 30 días anteriores
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4 min-w-0">
                <div className="flex items-center gap-2 border-b pb-2">
                    <h2 className="text-lg font-semibold">Estados de Cuenta Emitidos</h2>
                </div>
                <InvoiceList key={refreshKey} onChanged={fetchStats} />
            </div>

            <CreateInvoiceModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    fetchStats();
                    setRefreshKey((k) => k + 1);
                }}
            />
        </div>
    );
}
