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
import { format } from "date-fns";
import RecordPaymentModal from "./RecordPaymentModal";
import Link from "next/link";
import { Search, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { deleteInvoice, reassignInvoice, getCases, getInvoices } from "@/app/lib/api";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Case {
    id: number;
    title: string;
}

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
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
    const [invoiceToReassign, setInvoiceToReassign] = useState<Invoice | null>(null);
    const [cases, setCases] = useState<Case[]>([]);
    const [selectedCaseId, setSelectedCaseId] = useState<string>("");

    const fetchInvoices = async (search = "") => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const data = await getInvoices(url);

            // Filter locally by search term if provided
            if (search) {
                const filtered = data.filter((invoice: Invoice) =>
                    invoice.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
                    invoice.client?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                    invoice.case?.title?.toLowerCase().includes(search.toLowerCase())
                );
                setInvoices(filtered);
            } else {
                setInvoices(data);
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
            toast.error("Error al cargar las facturas");
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchInvoices(searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleDeleteInvoice = async () => {
        if (!invoiceToDelete) return;
        try {
            const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            await deleteInvoice(invoiceToDelete.id, url);
            toast.success("Factura eliminada exitosamente");
            fetchInvoices(searchTerm);
            setInvoiceToDelete(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al eliminar la factura');
        }
    };

    const handleReassignInvoice = async () => {
        if (!invoiceToReassign) return;
        try {
            const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const caseId = selectedCaseId === "none" ? null : parseInt(selectedCaseId);
            await reassignInvoice(invoiceToReassign.id, caseId, url);
            toast.success("Factura reasignada exitosamente");
            fetchInvoices(searchTerm);
            setInvoiceToReassign(null);
            setSelectedCaseId("");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al reasignar la factura');
        }
    };

    const openReassignModal = async (invoice: Invoice) => {
        setInvoiceToReassign(invoice);
        setSelectedCaseId(invoice.case?.title ? String(invoice.case) : "none");
        // Fetch cases for the client
        try {
            const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const clientCases = await getCases(url, invoice.client_id);
            setCases(clientCases);
        } catch (error) {
            console.error("Error fetching cases:", error);
            toast.error("Error al cargar los casos del cliente");
        }
    };

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
                                                <DropdownMenuItem onClick={() => openReassignModal(invoice)}>
                                                    Reasignar Caso
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => setInvoiceToDelete(invoice)}
                                                >
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar factura?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente la factura {invoiceToDelete?.invoice_number}.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteInvoice} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reassign Dialog */}
            <Dialog open={!!invoiceToReassign} onOpenChange={() => setInvoiceToReassign(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reasignar Factura a Otro Caso</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="case">Caso</Label>
                            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un caso..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Sin caso asignado</SelectItem>
                                    {cases.map((caseItem) => (
                                        <SelectItem key={caseItem.id} value={String(caseItem.id)}>
                                            {caseItem.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setInvoiceToReassign(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleReassignInvoice}>
                            Reasignar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
