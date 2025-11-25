"use client";

import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/store/Store";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import RecordPaymentModal from "./RecordPaymentModal";
import Link from "next/link";

interface Invoice {
    id: number;
    invoice_number: string;
    amount: number;
    balance_due: number;
    status: string;
    issue_date: string;
    due_date: string;
    client_id: number;
}

export default function InvoiceList() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const { user } = useAuthStore();
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const fetchInvoices = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/invoices`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setInvoices(data);
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-green-500">Pagada</Badge>;
            case "partial":
                return <Badge className="bg-yellow-500">Parcial</Badge>;
            case "sent":
                return <Badge className="bg-blue-500">Enviada</Badge>;
            case "overdue":
                return <Badge className="bg-red-500">Vencida</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Folio</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                                No hay facturas registradas.
                            </TableCell>
                        </TableRow>
                    ) : (
                        invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/dashboard/billing/${invoice.id}`} className="hover:underline text-blue-600">
                                        {invoice.invoice_number}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(invoice.issue_date), "dd MMM yyyy", { locale: es })}
                                </TableCell>
                                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                                <TableCell>${invoice.balance_due.toFixed(2)}</TableCell>
                                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/billing/${invoice.id}`}>
                                                Ver
                                            </Link>
                                        </Button>
                                        {invoice.status !== "paid" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedInvoice(invoice)}
                                            >
                                                Pagar
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {selectedInvoice && (
                <RecordPaymentModal
                    invoice={selectedInvoice}
                    isOpen={!!selectedInvoice}
                    onClose={() => {
                        setSelectedInvoice(null);
                        fetchInvoices();
                    }}
                />
            )}
        </div>
    );
}
