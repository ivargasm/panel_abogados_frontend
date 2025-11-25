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
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Invoice {
    id: number;
    invoice_number: string;
    amount: number;
    balance_due: number;
    status: string;
    issue_date: string;
    due_date: string;
    client_id: number;
    case?: {
        title: string;
    };
}

export default function InvoiceList() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuthStore();
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const fetchInvoices = async (search = "") => {
        try {
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/invoices`);
            if (search) {
                url.searchParams.append("search", search);
            }

            const response = await fetch(url.toString(), {
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
        const delayDebounceFn = setTimeout(() => {
            fetchInvoices(searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

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
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por folio, cliente o descripción..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Folio</TableHead>
                            <TableHead>Caso</TableHead>
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
                                        {invoice.case ? (
                                            <Badge variant="outline" className="font-normal">
                                                {invoice.case.title}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
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
        </div>
    );
}
