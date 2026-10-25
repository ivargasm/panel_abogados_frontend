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
import { es } from "date-fns/locale";
import RecordPaymentModal from "./RecordPaymentModal";
import Link from "next/link";
import { Search, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { API_URL, deleteInvoice, reassignInvoice, getCases, getInvoices } from "@/app/lib/api";
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
import type { Invoice } from "@/app/types";
import { formatCurrencyMXN } from "@/lib/legal-domain";

interface CaseOption {
    id: number;
    title: string;
}

interface InvoiceListProps {
    onChanged?: () => void;
}

export default function InvoiceList({ onChanged }: InvoiceListProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
    const [invoiceToReassign, setInvoiceToReassign] = useState<Invoice | null>(null);
    const [cases, setCases] = useState<CaseOption[]>([]);
    const [selectedCaseId, setSelectedCaseId] = useState<string>("none");

    const fetchInvoices = async (search = "") => {
        try {
            const data = await getInvoices(API_URL);
            if (search) {
                const q = search.toLowerCase();
                const filtered = data.filter((invoice) =>
                    invoice.invoice_number?.toLowerCase().includes(q) ||
                    invoice.client?.full_name?.toLowerCase().includes(q) ||
                    invoice.case?.title?.toLowerCase().includes(q) ||
                    invoice.description?.toLowerCase().includes(q)
                );
                setInvoices(filtered);
            } else {
                setInvoices(data);
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
            toast.error("Error al cargar los estados de cuenta");
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchInvoices(searchTerm);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleDeleteInvoice = async () => {
        if (!invoiceToDelete) return;
        try {
            await deleteInvoice(invoiceToDelete.id, API_URL);
            toast.success("Estado de cuenta eliminado exitosamente");
            fetchInvoices(searchTerm);
            onChanged?.();
            setInvoiceToDelete(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al eliminar el estado de cuenta");
        }
    };

    const handleReassignInvoice = async () => {
        if (!invoiceToReassign) return;
        try {
            const caseId = selectedCaseId === "none" ? null : parseInt(selectedCaseId, 10);
            await reassignInvoice(invoiceToReassign.id, caseId, API_URL);
            toast.success("Estado de cuenta vinculado al expediente");
            fetchInvoices(searchTerm);
            onChanged?.();
            setInvoiceToReassign(null);
            setSelectedCaseId("none");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al vincular al expediente");
        }
    };

    const openReassignModal = async (invoice: Invoice) => {
        setInvoiceToReassign(invoice);
        const currentCaseId = invoice.case_id ?? invoice.case?.id ?? null;
        setSelectedCaseId(currentCaseId ? String(currentCaseId) : "none");
        try {
            const clientCases = await getCases(API_URL, invoice.client_id);
            setCases(clientCases);
        } catch (error) {
            console.error("Error fetching cases:", error);
            toast.error("Error al cargar los expedientes del cliente");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-none shadow-none font-medium">Liquidado</Badge>;
            case "partial":
                return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-none shadow-none font-medium">Pago Parcial</Badge>;
            case "sent":
                return <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-none shadow-none font-medium">Pendiente</Badge>;
            case "overdue":
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-none shadow-none font-medium">Vencido</Badge>;
            case "draft":
                return <Badge variant="secondary" className="font-medium">Borrador</Badge>;
            default:
                return <Badge variant="secondary" className="font-medium">{status}</Badge>;
        }
    };

    const filteredInvoices = invoices.filter((invoice) => {
        if (statusFilter === "all") return true;
        return invoice.status === statusFilter;
    });

    return (
        <div className="space-y-4 bg-card text-card-foreground p-4 rounded-lg border shadow-sm w-full max-w-[100vw] sm:max-w-full">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por folio, cliente, asunto o expediente..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Estado: Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Estado: Todos</SelectItem>
                            <SelectItem value="sent">Pendiente de Pago</SelectItem>
                            <SelectItem value="partial">Pago Parcial</SelectItem>
                            <SelectItem value="overdue">Vencido</SelectItem>
                            <SelectItem value="paid">Liquidado</SelectItem>
                        </SelectContent>
                    </Select>

                    {(searchTerm || statusFilter !== "all") && (
                        <Button
                            variant="ghost"
                            className="w-full sm:w-auto"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                            }}
                        >
                            Limpiar Filtros
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto w-full">
                <Table className="min-w-[700px]">
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Folio</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Cliente</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Expediente</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Total</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Saldo</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Vencimiento</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Estado</TableHead>
                            <TableHead className="text-right font-semibold text-xs text-muted-foreground uppercase tracking-wider">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No se encontraron estados de cuenta registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInvoices.map((invoice) => (
                                <TableRow key={invoice.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium text-primary">
                                        <Link href={`/dashboard/billing/${invoice.id}`} className="hover:underline">
                                            {invoice.invoice_number}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-sm">
                                            {invoice.client?.full_name || "Cliente"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {invoice.case ? (
                                            <span className="text-sm text-muted-foreground line-clamp-1 max-w-[240px]">
                                                {invoice.case.title}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">Asesoría general</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {formatCurrencyMXN(invoice.amount)}
                                    </TableCell>
                                    <TableCell className={invoice.balance_due > 0 ? "font-semibold text-amber-700 dark:text-amber-400" : "text-muted-foreground"}>
                                        {formatCurrencyMXN(invoice.balance_due)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {invoice.due_date
                                            ? format(new Date(invoice.due_date), "dd MMM yyyy", { locale: es })
                                            : "Sin vencimiento"}
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
                                                    <Link href={`/dashboard/billing/${invoice.id}`}>Ver Estado de Cuenta / PDF</Link>
                                                </DropdownMenuItem>
                                                {invoice.balance_due > 0 && (
                                                    <DropdownMenuItem onClick={() => setSelectedInvoice(invoice)}>
                                                        Registrar Abono
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => openReassignModal(invoice)}>
                                                    Vincular a Expediente
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
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

            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
                <span>
                    Mostrando {filteredInvoices.length} de {invoices.length} estado(s) de cuenta
                </span>
            </div>

            {selectedInvoice && (
                <RecordPaymentModal
                    invoice={selectedInvoice}
                    isOpen={!!selectedInvoice}
                    onClose={() => {
                        setSelectedInvoice(null);
                        fetchInvoices(searchTerm);
                        onChanged?.();
                    }}
                />
            )}

            <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar estado de cuenta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará permanentemente el folio {invoiceToDelete?.invoice_number} y sus abonos asociados.
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

            <Dialog open={!!invoiceToReassign} onOpenChange={() => setInvoiceToReassign(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Vincular Estado de Cuenta a un Expediente</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="case">Expediente del Cliente</Label>
                            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un expediente..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Asesoría general (sin expediente)</SelectItem>
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
                            Guardar Vínculo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
