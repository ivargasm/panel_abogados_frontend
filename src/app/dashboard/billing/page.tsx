"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import InvoiceList from "@/components/billing/InvoiceList";
import CreateInvoiceModal from "@/components/billing/CreateInvoiceModal";
import { getBillingStats } from "@/app/lib/api";

export default function BillingPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [stats, setStats] = useState({
        total_billed: 0,
        total_collected: 0,
        total_due: 0,
        invoice_count: 0,
        collected_last_30: 0,
        payment_percentage_change: 0
    });

    const fetchStats = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            if (!process.env.NEXT_PUBLIC_API_URL) {
                console.warn("NEXT_PUBLIC_API_URL is not defined. Using default: http://localhost:8000");
            }
            const data = await getBillingStats(apiUrl);
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="flex flex-col gap-6 w-full max-w-full overflow-x-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Facturación y Pagos</h1>
                    <p className="text-muted-foreground">Gestiona todas las facturas y pagos de tu firma.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#1e293b] hover:bg-[#0f172a] w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Nueva Factura
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendiente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-[#1e293b]">${stats.total_due.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Monto total por cobrar
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Vencido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-[#1e293b]">${(stats.total_billed - stats.total_collected - stats.total_due).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Facturas con fecha vencida
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pagado (Últimos 30 Días)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-[#1e293b]">${stats.collected_last_30?.toFixed(2) || "0.00"}</div>
                        <p className={`text-xs font-medium mt-1 ${stats.payment_percentage_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.payment_percentage_change > 0 ? '+' : ''}{stats.payment_percentage_change?.toFixed(1) || "0.0"}% vs 30 días anteriores
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4 min-w-0">
                <div className="flex items-center gap-2 border-b pb-2">
                    <h2 className="text-lg font-semibold">Facturas</h2>
                </div>
                <InvoiceList key={stats.invoice_count} />
            </div>

            <CreateInvoiceModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    fetchStats();
                }}
            />
        </div>
    );
}
