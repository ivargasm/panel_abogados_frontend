"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, CreditCard, Pencil, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import RecordPaymentModal from "@/components/billing/RecordPaymentModal";
import EditPaymentModal from "@/components/billing/EditPaymentModal";
import AddItemModal from "@/components/billing/AddItemModal";
import EditItemModal from "@/components/billing/EditItemModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
}

interface Payment {
    id: number;
    amount: number;
    payment_date: string;
    method: string;
    notes: string;
}

interface InvoiceDetail {
    id: number;
    invoice_number: string;
    amount: number;
    balance_due: number;
    status: string;
    issue_date: string;
    due_date: string;
    description: string;
    client_id: number;
    items: InvoiceItem[];
    payments: Payment[];
}

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

    // Item management state
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InvoiceItem | null>(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
    const [itemToDelete, setItemToDelete] = useState<{ item: InvoiceItem, index: number } | null>(null);

    const fetchInvoice = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/invoices/${params.id}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setInvoice(data);
            } else {
                toast.error("No se pudo cargar la factura");
                router.push("/dashboard/billing");
            }
        } catch (error) {
            console.error("Error fetching invoice:", error);
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchInvoice();
        }
    }, [params.id]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid": return <Badge className="bg-green-500">Pagada</Badge>;
            case "partial": return <Badge className="bg-yellow-500">Parcial</Badge>;
            case "sent": return <Badge className="bg-blue-500">Enviada</Badge>;
            case "overdue": return <Badge className="bg-red-500">Vencida</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const handleEditPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsEditModalOpen(true);
    };

    const handleDeletePayment = async () => {
        if (!paymentToDelete) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/payments/${paymentToDelete.id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.ok) {
                toast.success("Pago eliminado correctamente");
                setPaymentToDelete(null);
                fetchInvoice();
            } else {
                const error = await response.json();
                toast.error(error.detail || "Error al eliminar el pago");
            }
        } catch (error) {
            console.error("Error deleting payment:", error);
            toast.error("Error de conexión");
        }
    };

    const handleEditItem = (item: InvoiceItem, index: number) => {
        setSelectedItem(item);
        setSelectedItemIndex(index);
        setIsEditItemModalOpen(true);
    };

    const handleDeleteItem = async () => {
        if (!itemToDelete) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/invoices/${params.id}/items/${itemToDelete.index}`, {
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

    if (loading) return <div className="p-8">Cargando...</div>;
    if (!invoice) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <h1 className="text-2xl font-bold">Factura {invoice.invoice_number}</h1>
                {getStatusBadge(invoice.status)}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Fecha de Emisión:</span>
                            <span className="font-medium">
                                {format(new Date(invoice.issue_date), "dd MMM yyyy", { locale: es })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Fecha de Vencimiento:</span>
                            <span className="font-medium">
                                {invoice.due_date ? format(new Date(invoice.due_date), "dd MMM yyyy", { locale: es }) : "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Descripción:</span>
                            <span className="font-medium">{invoice.description || "Sin descripción"}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Resumen Financiero</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-lg">
                            <span>Total:</span>
                            <span className="font-bold">${invoice.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                            <span>Pagado:</span>
                            <span className="text-green-600 font-bold">
                                ${(invoice.amount - invoice.balance_due).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-lg border-t pt-2">
                            <span>Saldo Pendiente:</span>
                            <span className="text-red-600 font-bold">${invoice.balance_due.toFixed(2)}</span>
                        </div>

                        {invoice.status !== "paid" && (
                            <Button className="w-full mt-4" onClick={() => setIsPaymentModalOpen(true)}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Registrar Pago
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Conceptos</CardTitle>
                    <Button onClick={() => setIsAddItemModalOpen(true)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Concepto
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead className="text-right">Precio Unitario</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.items && invoice.items.length > 0 ? (
                                invoice.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
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
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        Sin conceptos detallados
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Pagos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Notas</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.payments && invoice.payments.length > 0 ? (
                                invoice.payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            {format(new Date(payment.payment_date), "dd MMM yyyy HH:mm", { locale: es })}
                                        </TableCell>
                                        <TableCell>{payment.method}</TableCell>
                                        <TableCell>{payment.notes || "-"}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${payment.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
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
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No hay pagos registrados
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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
                        <AlertDialogTitle>¿Eliminar pago?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El saldo de la factura se ajustará automáticamente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePayment} className="bg-red-500 hover:bg-red-600">
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
                            Esta acción no se puede deshacer. El total de la factura se recalculará automáticamente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteItem} className="bg-red-500 hover:bg-red-600">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
