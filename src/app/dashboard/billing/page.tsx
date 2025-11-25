"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import InvoiceList from "@/components/billing/InvoiceList";
import CreateInvoiceModal from "@/components/billing/CreateInvoiceModal";
import { useAuthStore } from "@/app/store/Store";
import { getBillingStats } from "@/app/lib/api";

export default function BillingPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        total_billed: 0,
        total_collected: 0,
        total_due: 0,
        invoice_count: 0
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
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Facturación Interna</h1>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Factura
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.total_billed.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.invoice_count} facturas generadas
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cobrado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${stats.total_collected.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Ingresos registrados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">${stats.total_due.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Saldo pendiente
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
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
