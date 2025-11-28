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
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/app/store/Store";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import RecordPaymentModal from "./RecordPaymentModal";
import Link from "next/link";
import { Search, MoreVertical, Filter, ChevronLeft, ChevronRight } from "lucide-react";
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
    client?: {
        full_name: string;
        email?: string;
    };
    case?: {
        title: string;
    };
}

export default function InvoiceList() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuthStore();
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchInvoices = async (search = "") => {
        try {
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/invoices`);
            if (search) {
                url.searchParams.append("search", search);
            }
            // Note: Backend might not support status filtering yet, implementing UI for now

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
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none font-medium">Pagada</Badge>;
            case "partial":
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none shadow-none font-medium">Parcial</Badge>;
            case "sent":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none font-medium">Enviada</Badge>;
            case "overdue":
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none font-medium">Vencida</Badge>;
            case "draft":
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none shadow-none font-medium">Borrador</Badge>;
            default:
                return <Badge variant="secondary" className="font-medium">{status}</Badge>;
        }
    };

    // Filter invoices locally for now if backend doesn't support it
    const filteredInvoices = invoices.filter(invoice => {
        if (statusFilter === "all") return true;
        return invoice.status === statusFilter;
    });

    return (
        <div className="space-y-4 bg-white p-4 rounded-lg border shadow-sm w-full max-w-[100vw] sm:max-w-full">
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por # Factura, Cliente o Caso..."
                        className="pl-8 bg-gray-50 border-gray-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[140px] bg-gray-50 border-gray-200">
                            <SelectValue placeholder="Estado: Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Estado: Todos</SelectItem>
                            <SelectItem value="paid">Pagada</SelectItem>
                            <SelectItem value="overdue">Vencida</SelectItem>
                            <SelectItem value="partial">Parcial</SelectItem>
                            <SelectItem value="draft">Borrador</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="bg-gray-50 border-gray-200 text-gray-600 w-full sm:w-auto">
                        Rango de Fechas
                    </Button>

                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full sm:w-auto" onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                    }}>
                        Limpiar Filtros
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto w-full">
                <Table className="min-w-[600px]">
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Checkbox />
                            </TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Nº Factura</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Cliente</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Caso</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Monto</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Fecha Vencimiento</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Estado</TableHead>
                            <TableHead className="text-right font-semibold text-xs text-muted-foreground uppercase tracking-wider">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No se encontraron facturas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInvoices.map((invoice) => (
                                <TableRow key={invoice.id} className="hover:bg-gray-50/50">
                                    <TableCell>
                                        <Checkbox />
                                    </TableCell>
                                    <TableCell className="font-medium text-blue-600">
                                        <Link href={`/dashboard/billing/${invoice.id}`} className="hover:underline">
                                            {invoice.invoice_number}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">
                                                {invoice.client?.full_name || 'Cliente Desconocido'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {invoice.case ? (
                                            <span className="text-sm text-gray-600">
                                                {invoice.case.title}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        ${invoice.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {format(new Date(invoice.due_date || invoice.issue_date), "yyyy-MM-dd")}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/billing/${invoice.id}`}>Ver Detalles</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSelectedInvoice(invoice)}>
                                                    Registrar Pago
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination (Mocked for visual completeness) */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                    Mostrando 1 a {filteredInvoices.length} de {filteredInvoices.length} facturas
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" disabled>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium">1 / 1</div>
                    <Button variant="outline" size="icon" disabled>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

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
