"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CreditCard, Pencil, Trash2, Plus, Printer, Scale, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import RecordPaymentModal from "@/components/billing/RecordPaymentModal";
import EditPaymentModal from "@/components/billing/EditPaymentModal";
import AddItemModal from "@/components/billing/AddItemModal";
import EditItemModal from "@/components/billing/EditItemModal";
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
import { toast } from "sonner";
import { API_URL, getPaymentReceiptUrl } from "@/app/lib/api";
import { useAuthStore } from "@/app/store/Store";
import type { Invoice, InvoiceItemType, PaymentRecord } from "@/app/types";
import { formatCurrencyMXN, PAYMENT_METHOD_LABELS } from "@/lib/legal-domain";

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
    const [paymentToDelete, setPaymentToDelete] = useState<PaymentRecord | null>(null);

    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InvoiceItemType | null>(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
    const [itemToDelete, setItemToDelete] = useState<{ item: InvoiceItemType; index: number } | null>(null);

    const fetchInvoice = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/billing/invoices/${params.id}`, {
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setInvoice(data);
            } else {
                toast.error("No se pudo cargar el estado de cuenta");
                router.push("/dashboard/billing");
            }
        } catch (error) {
            console.error("Error fetching invoice:", error);
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        if (params.id) {
            fetchInvoice();
        }
    }, [params.id, fetchInvoice]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-emerald-600 text-white">Liquidado</Badge>;
            case "partial":
                return <Badge className="bg-amber-500 text-white">Pago Parcial</Badge>;
            case "sent":
                return <Badge className="bg-sky-600 text-white">Pendiente de Pago</Badge>;
            case "overdue":
                return <Badge className="bg-red-600 text-white">Vencido</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const handleEditPayment = (payment: PaymentRecord) => {
        setSelectedPayment(payment);
        setIsEditModalOpen(true);
    };

    const handleDeletePayment = async () => {
        if (!paymentToDelete) return;
        try {
            const response = await fetch(`${API_URL}/api/billing/payments/${paymentToDelete.id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.ok) {
                toast.success("Abono eliminado correctamente");
                setPaymentToDelete(null);
                fetchInvoice();
            } else {
                const error = await response.json();
                toast.error(error.detail || "Error al eliminar el abono");
            }
        } catch (error) {
            console.error("Error deleting payment:", error);
            toast.error("Error de conexión");
        }
    };

    const handleViewReceipt = async (paymentId: number) => {
        try {
            const res = await getPaymentReceiptUrl(paymentId, API_URL);
            if (res.download_url) {
                window.open(res.download_url, "_blank");
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al consultar el comprobante");
        }
    };

    const handleEditItem = (item: InvoiceItemType, index: number) => {
        setSelectedItem(item);
        setSelectedItemIndex(index);
        setIsEditItemModalOpen(true);
    };

    const handleDeleteItem = async () => {
        if (!itemToDelete) return;
        try {
            const response = await fetch(`${API_URL}/api/billing/invoices/${params.id}/items/${itemToDelete.index}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.ok) {
                toast.success("Concepto eliminado correctamente");
                setItemToDelete(null);
                fetchInvoice();
            } else {
                const error = await response.json();
                toast.error(error.detail || "Error al eliminar el concepto");
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            toast.error("Error de conexión");
        }
    };

    if (loading) return <div className="p-8 text-muted-foreground">Cargando estado de cuenta...</div>;
    if (!invoice) return null;

    const totalPaid = Math.max(0, invoice.amount - invoice.balance_due);

    return (
        <div className="space-y-6 w-full max-w-full overflow-x-hidden">
            {/* Encabezado Membretado exclusivo para Impresión / PDF */}
            <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6 text-black">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Scale className="h-6 w-6 text-slate-900" />
                            <h1 className="text-xl font-bold uppercase tracking-wide">
                                {user?.workspace_name || "Despacho Jurídico"}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                            Titular / Responsable: {user?.full_name}
                            {user?.professional_license ? ` • Cédula Profesional: ${user.professional_license}` : ""}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase font-semibold tracking-wider text-slate-500">
                            Estado de Cuenta de Honorarios
                        </p>
                        <p className="text-lg font-bold">{invoice.invoice_number}</p>
                        <p className="text-xs text-slate-600">
                            Fecha de impresión: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Barra de acciones superior (oculta al imprimir) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/billing")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <h1 className="text-2xl font-bold">Estado de Cuenta {invoice.invoice_number}</h1>
                    {getStatusBadge(invoice.status)}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir / Exportar PDF
                    </Button>
                    {invoice.balance_due > 0 && (
                        <Button onClick={() => setIsPaymentModalOpen(true)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Registrar Abono
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="print:shadow-none print:border-slate-300">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Datos del Cliente y Asunto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Cliente:</span>
                            <span className="font-semibold text-right">
                                {invoice.client?.full_name || `Cliente #${invoice.client_id}`}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Expediente / Asunto:</span>
                            <span className="font-medium text-right">
                                {invoice.case ? invoice.case.title : "Asesoría jurídica general"}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Fecha de Emisión:</span>
                            <span className="font-medium">
                                {format(new Date(invoice.issue_date), "dd MMM yyyy", { locale: es })}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Fecha Límite de Pago:</span>
                            <span className="font-medium">
                                {invoice.due_date
                                    ? format(new Date(invoice.due_date), "dd MMM yyyy", { locale: es })
                                    : "Sin vencimiento fijo"}
                            </span>
                        </div>
                        <div className="pt-2 border-t">
                            <span className="text-muted-foreground block text-xs mb-1">Concepto / Convenio:</span>
                            <p className="font-medium">{invoice.description || "Honorarios profesionales"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="print:shadow-none print:border-slate-300">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Resumen Financiero</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-base">
                            <span className="text-muted-foreground">Honorarios Pactados:</span>
                            <span className="font-bold">{formatCurrencyMXN(invoice.amount)}</span>
                        </div>
                        <div className="flex justify-between text-base">
                            <span className="text-muted-foreground">Total Abonado:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {formatCurrencyMXN(totalPaid)}
                            </span>
                        </div>
                        <div className="flex justify-between text-lg border-t pt-3">
                            <span className="font-semibold">Saldo Pendiente:</span>
                            <span className={invoice.balance_due > 0 ? "text-red-600 dark:text-red-400 font-bold" : "text-emerald-600 font-bold"}>
                                {formatCurrencyMXN(invoice.balance_due)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="print:shadow-none print:border-slate-300">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Desglose de Conceptos</CardTitle>
                    <Button onClick={() => setIsAddItemModalOpen(true)} size="sm" variant="outline" className="print:hidden">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Concepto
                    </Button>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table className="min-w-[560px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-right">Cant.</TableHead>
                                <TableHead className="text-right">Importe Unitario</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                                <TableHead className="text-right print:hidden">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.items && invoice.items.length > 0 ? (
                                invoice.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrencyMXN(item.price)}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrencyMXN(item.quantity * item.price)}
                                        </TableCell>
                                        <TableCell className="text-right print:hidden">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditItem(item, index)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setItemToDelete({ item, index })}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                                        {invoice.description
                                            ? `${invoice.description} — ${formatCurrencyMXN(invoice.amount)}`
                                            : "Sin partidas individuales desglosadas"}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="print:shadow-none print:border-slate-300">
                <CardHeader>
                    <CardTitle className="text-base">Historial de Abonos Recibidos</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table className="min-w-[560px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha de Recepción</TableHead>
                                <TableHead>Forma de Pago</TableHead>
                                <TableHead>Banco / Rastreo SPEI / Comprobante</TableHead>
                                <TableHead>Referencia / Notas</TableHead>
                                <TableHead className="text-right">Monto Abonado</TableHead>
                                <TableHead className="text-right print:hidden">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.payments && invoice.payments.length > 0 ? (
                                invoice.payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            {format(new Date(payment.payment_date), "dd MMM yyyy, HH:mm", { locale: es })}
                                        </TableCell>
                                        <TableCell>{PAYMENT_METHOD_LABELS[payment.method] || payment.method}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {payment.issuing_bank && (
                                                    <div className="text-xs font-semibold text-foreground">
                                                        {payment.issuing_bank}
                                                    </div>
                                                )}
                                                {payment.tracking_key && (
                                                    <div className="text-[11px] font-mono text-muted-foreground truncate max-w-[220px]">
                                                        SPEI: {payment.tracking_key}
                                                    </div>
                                                )}
                                                {payment.receipt_file_path ? (
                                                    <div className="pt-0.5">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewReceipt(payment.id)}
                                                            className="h-6 px-2 text-xs text-primary gap-1 print:hidden"
                                                        >
                                                            <FileText className="h-3 w-3" /> Ver Comprobante
                                                        </Button>
                                                        <span className="hidden print:inline text-[10px] text-slate-500">
                                                            • Comprobante resguardado en S3/MinIO
                                                        </span>
                                                    </div>
                                                ) : (
                                                    !payment.issuing_bank && !payment.tracking_key && <span className="text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{payment.notes || "-"}</TableCell>
                                        <TableCell className="text-right font-medium text-emerald-700 dark:text-emerald-400">
                                            {formatCurrencyMXN(payment.amount)}
                                        </TableCell>
                                        <TableCell className="text-right print:hidden">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditPayment(payment)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setPaymentToDelete(payment)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                        No se han registrado abonos para este estado de cuenta.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="hidden print:block pt-8 text-center text-xs text-slate-500 border-t border-slate-300">
                Documento informativo de control de honorarios emitido a través de LexControl • {user?.workspace_name || "Despacho Jurídico"}
            </div>

            <RecordPaymentModal
                invoice={invoice}
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    fetchInvoice();
                }}
            />

            <EditPaymentModal
                payment={selectedPayment}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedPayment(null);
                    fetchInvoice();
                }}
            />

            <AlertDialog open={!!paymentToDelete} onOpenChange={() => setPaymentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar abono?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El saldo pendiente del estado de cuenta se recalculará automáticamente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePayment} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AddItemModal
                invoiceId={invoice.id}
                isOpen={isAddItemModalOpen}
                onClose={() => {
                    setIsAddItemModalOpen(false);
                    fetchInvoice();
                }}
            />

            <EditItemModal
                invoiceId={invoice.id}
                item={selectedItem}
                itemIndex={selectedItemIndex}
                isOpen={isEditItemModalOpen}
                onClose={() => {
                    setIsEditItemModalOpen(false);
                    setSelectedItem(null);
                    setSelectedItemIndex(-1);
                    fetchInvoice();
                }}
            />

            <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar concepto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El monto total y el saldo pendiente se ajustarán automáticamente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
