"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/app/store/Store';
import { getMyCaseDetails } from '@/app/lib/api';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarCheck, User, DollarSign, FileText } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ClientCaseDetail, CaseUpdate } from '@/app/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

// Mapeo de estatus a clases de Tailwind para los badges
const statusClasses: { [key: string]: string } = {
    "Completado": "bg-success/10 text-success border-success/20",
    "En Proceso": "bg-primary/10 text-primary border-primary/20",
    "Pendiente": "bg-warning/10 text-warning border-warning/20",
    "Cancelado": "bg-destructive/10 text-destructive border-destructive/20"
};
const defaultStatusClass = "bg-muted text-muted-foreground border-border";

const invoiceStatusClasses: { [key: string]: string } = {
    "paid": "bg-green-500/10 text-green-600 border-green-500/20",
    "partial": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    "sent": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "overdue": "bg-red-500/10 text-red-600 border-red-500/20",
};

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

interface Invoice {
    id: number;
    invoice_number: string;
    amount: number;
    balance_due: number;
    status: string;
    issue_date: string;
    description: string;
    items: InvoiceItem[];
    payments: Payment[];
}

// --- Componente de Esqueleto de Carga Mejorado ---
const DetailPageSkeleton = () => (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <Skeleton className="h-8 w-40 mb-8" />
        <Card className="mb-8">
            <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6 mt-2" />
            </CardContent>
        </Card>
        <Skeleton className="h-7 w-64 mb-6" />
        <div className="space-y-8">
            <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </div>
    </div>
);


// --- Componente de la Línea de Tiempo Rediseñado ---
const TimelineItem = ({ update, isLast }: { update: CaseUpdate, isLast: boolean }) => {
    return (
        <div className="relative flex items-start gap-x-5">
            {!isLast && <div className="absolute left-5 top-5 -bottom-5 w-px bg-border" />}

            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex-grow pt-1">
                <div className="flex items-center gap-x-2">
                    <p className="font-semibold text-foreground">{update.created_by.full_name}</p>
                    <Badge className={`border text-xs font-semibold ${statusClasses[update.status] || defaultStatusClass}`}>
                        {update.status}
                    </Badge>
                </div>
                <p className="mt-1 text-sm text-foreground/80 whitespace-pre-wrap">{update.update_text}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                    {format(new Date(update.created_at), "d 'de' LLLL 'de' yyyy, h:mm a", { locale: es })}
                </p>
            </div>
        </div>
    );
};

// --- Componente Principal de la Página Rediseñada ---
export default function CaseDetailPage() {
    const params = useParams();
    const { url } = useAuthStore();
    const caseId = params.caseId as string;

    const [caseDetails, setCaseDetails] = useState<ClientCaseDetail | null>(null);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingBilling, setLoadingBilling] = useState(false);
    const [billingError, setBillingError] = useState<string | null>(null);

    useEffect(() => {
        if (caseId) {
            const fetchDetails = async () => {
                try {
                    setLoading(true);
                    const data = await getMyCaseDetails(caseId, url);
                    setCaseDetails(data);
                } catch (err) {
                    console.error("Error fetching case details:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [caseId, url]);

    const fetchBilling = async () => {
        try {
            setLoadingBilling(true);
            setBillingError(null);
            const res = await fetch(`${url}/api/portal/my-cases/${caseId}/billing`, { credentials: 'include' });

            if (!res.ok) {
                if (res.status === 403) {
                    setBillingError('No tienes permiso para ver la facturación.');
                } else if (res.status === 404) {
                    setBillingError('No hay información de facturación para este caso.');
                } else {
                    setBillingError('Error al cargar la facturación.');
                }
                return;
            }

            const data = await res.json();
            setInvoice(data);
        } catch (err) {
            console.error(err);
            setBillingError('Error de conexión');
            toast.error('No se pudo cargar la facturación');
        } finally {
            setLoadingBilling(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const labels: { [key: string]: string } = {
            "paid": "Pagada",
            "partial": "Parcial",
            "sent": "Enviada",
            "overdue": "Vencida",
            "draft": "Borrador",
        };

        return (
            <Badge className={`border ${invoiceStatusClasses[status] || "bg-muted"}`}>
                {labels[status] || status}
            </Badge>
        );
    };

    if (loading) {
        return <div className="bg-muted/30 min-h-screen w-full"><DetailPageSkeleton /></div>;
    }

    if (!caseDetails) {
        return <div className="flex h-screen items-center justify-center text-center">No se encontraron los datos del caso.</div>;
    }

    return (
        <ProtectedRoute allowedRoles={['client']}>
            <div className="bg-muted/30 min-h-screen w-full">
                <div className="container mx-auto max-w-4xl p-4 md:p-8">
                    <Button asChild variant="ghost" className="mb-6">
                        <Link href="/portal-cliente">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a mis casos
                        </Link>
                    </Button>

                    <Card className="mb-10 overflow-hidden shadow-sm">
                        <CardHeader className="bg-muted/50 p-6">
                            <Badge variant="secondary" className="w-fit mb-2">{caseDetails.status.replace('_', ' ').toUpperCase()}</Badge>
                            <CardTitle className="text-2xl">{caseDetails.title}</CardTitle>
                            {caseDetails.case_number && <CardDescription>Expediente: {caseDetails.case_number}</CardDescription>}
                        </CardHeader>
                        {caseDetails.description && (
                            <CardContent className="p-6 text-foreground/80">
                                <p>{caseDetails.description}</p>
                            </CardContent>
                        )}
                    </Card>

                    <Tabs defaultValue="avances" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="avances">Avances</TabsTrigger>
                            <TabsTrigger value="facturacion" onClick={() => !invoice && !billingError && fetchBilling()}>
                                Facturación
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="avances" className="mt-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-6 text-foreground">Línea de Tiempo y Avances</h2>
                                {caseDetails.updates.length > 0 ? (
                                    <div className="space-y-8">
                                        {caseDetails.updates.map((update, index) => (
                                            <TimelineItem
                                                key={update.id}
                                                update={update}
                                                isLast={index === caseDetails.updates.length - 1}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 px-6 border-2 border-dashed border-border rounded-lg">
                                        <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-medium text-foreground">Sin avances por ahora</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">Tu abogado registrará aquí todas las novedades del caso.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="facturacion" className="mt-6">
                            {loadingBilling ? (
                                <div className="text-center py-16">
                                    <p>Cargando facturación...</p>
                                </div>
                            ) : billingError ? (
                                <Card>
                                    <CardContent className="py-16 text-center">
                                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium text-foreground">{billingError}</h3>
                                    </CardContent>
                                </Card>
                            ) : invoice ? (
                                <div className="space-y-6">
                                    {/* Resumen de Factura */}
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle>Factura {invoice.invoice_number}</CardTitle>
                                                {getStatusBadge(invoice.status)}
                                            </div>
                                            <CardDescription>
                                                Emitida el {format(new Date(invoice.issue_date), "d 'de' LLLL 'de' yyyy", { locale: es })}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total</p>
                                                    <p className="text-2xl font-bold">${invoice.amount.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                                                    <p className="text-2xl font-bold text-orange-600">${invoice.balance_due.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            {invoice.description && (
                                                <p className="mt-4 text-sm text-muted-foreground">{invoice.description}</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Conceptos/Items */}
                                    {invoice.items && invoice.items.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Conceptos</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Descripción</TableHead>
                                                            <TableHead className="text-right">Cantidad</TableHead>
                                                            <TableHead className="text-right">Precio</TableHead>
                                                            <TableHead className="text-right">Subtotal</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {invoice.items.map((item, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{item.description}</TableCell>
                                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                                                <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Pagos */}
                                    {invoice.payments && invoice.payments.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Abonos Realizados</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Fecha</TableHead>
                                                            <TableHead>Método</TableHead>
                                                            <TableHead>Notas</TableHead>
                                                            <TableHead className="text-right">Monto</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {invoice.payments.map((payment) => (
                                                            <TableRow key={payment.id}>
                                                                <TableCell>
                                                                    {format(new Date(payment.payment_date), "dd MMM yyyy", { locale: es })}
                                                                </TableCell>
                                                                <TableCell>{payment.method}</TableCell>
                                                                <TableCell>{payment.notes || '-'}</TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    ${payment.amount.toFixed(2)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            ) : null}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </ProtectedRoute>
    );
}
