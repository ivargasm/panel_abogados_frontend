"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/app/store/Store';
import { getMyCaseDetails } from '@/app/lib/api';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, FileText, Users, DollarSign } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ClientCaseDetail, CaseUpdate } from '@/app/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

// Configuración de estados de caso
const caseStatusConfig: { [key: string]: { label: string; className: string } } = {
    "active": { label: "Activo", className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100" },
    "on_hold": { label: "En Espera", className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100" },
    "pending_review": { label: "Pendiente de Revisión", className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100" },
    "closed": { label: "Cerrado", className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100" },
};

// Configuración de estados de transacción
const transactionStatusConfig: { [key: string]: { label: string; className: string } } = {
    "paid": { label: "Pagado", className: "bg-green-100 text-green-800 border-green-200" },
    "pending": { label: "Pendiente", className: "bg-blue-100 text-blue-800 border-blue-200" },
    "overdue": { label: "Vencido", className: "bg-red-100 text-red-800 border-red-200" },
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

// Componente de esqueleto de carga
const DetailPageSkeleton = () => (
    <div className="container mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="h-10 w-40 mb-6" />
        <div className="bg-white rounded-lg p-6 mb-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
        </div>
        <Skeleton className="h-12 w-full mb-6" />
        <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    </div>
);

// Función para obtener icono según el tipo de actualización
const getUpdateIcon = (updateText: string, status: string) => {
    const text = updateText.toLowerCase();

    if (status === "Completado" || text.includes("completado") || text.includes("filed") || text.includes("presentado")) {
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    } else if (text.includes("documento") || text.includes("document") || text.includes("revisión") || text.includes("review")) {
        return <FileText className="h-6 w-6 text-blue-600" />;
    } else if (text.includes("consulta") || text.includes("reunión") || text.includes("consultation") || text.includes("meeting")) {
        return <Users className="h-6 w-6 text-purple-600" />;
    }

    return <FileText className="h-6 w-6 text-gray-600" />;
};

// Componente de item del timeline
const TimelineItem = ({ update, isLast }: { update: CaseUpdate, isLast: boolean }) => {
    const icon = getUpdateIcon(update.update_text, update.status);
    const isCompleted = update.status === "Completado";

    return (
        <div className="relative flex items-start gap-x-4">
            {!isLast && <div className="absolute left-6 top-12 -bottom-6 w-0.5 bg-gray-200" />}

            <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-full ${isCompleted ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                {icon}
            </div>

            <div className="flex-grow pt-1">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">
                            {format(new Date(update.created_at), "MMM dd, yyyy", { locale: es })}
                        </p>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {update.update_text.split('\n')[0]}
                        </h3>
                        {update.update_text.includes('\n') && (
                            <p className="text-sm text-gray-600 mt-2">
                                {update.update_text.split('\n').slice(1).join('\n')}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente principal
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
                    toast.error("Error al cargar los detalles del caso");
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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['client']}>
                <div className="bg-gray-50 min-h-screen">
                    <DetailPageSkeleton />
                </div>
            </ProtectedRoute>
        );
    }

    if (!caseDetails) {
        return (
            <ProtectedRoute allowedRoles={['client']}>
                <div className="flex h-screen items-center justify-center text-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Caso no encontrado</h2>
                        <p className="text-gray-600">No se encontraron los datos del caso.</p>
                        <Button asChild className="mt-4">
                            <Link href="/portal-cliente">Volver a mis casos</Link>
                        </Button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    // Calcular totales de facturación
    const totalPaid = invoice ? invoice.amount - invoice.balance_due : 0;
    const pendingBalance = invoice ? invoice.balance_due : 0;

    return (
        <ProtectedRoute allowedRoles={['client']}>
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto max-w-5xl px-4 py-8">
                    {/* Botón de regreso */}
                    <Button asChild variant="ghost" className="mb-6 -ml-2">
                        <Link href="/portal-cliente">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a mis casos
                        </Link>
                    </Button>

                    {/* Header del caso */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                            {caseDetails.case_number ? `Caso #${caseDetails.case_number}: ` : ''}{caseDetails.title}
                        </h1>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Estado:</span>
                                <Badge
                                    variant="outline"
                                    className={`text-xs font-medium px-3 py-1 ${caseStatusConfig[caseDetails.status]?.className ||
                                        "bg-gray-100 text-gray-800 border-gray-200"
                                        }`}
                                >
                                    {caseStatusConfig[caseDetails.status]?.label || caseDetails.status}
                                </Badge>
                            </div>
                        </div>

                        {caseDetails.assigned_lawyer && (
                            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-gray-200 text-gray-700">
                                        {getInitials(caseDetails.assigned_lawyer.full_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm text-gray-600">Abogado Asignado</p>
                                    <p className="font-medium text-gray-900">{caseDetails.assigned_lawyer.full_name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="progress" className="w-full">
                        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1">
                            <TabsTrigger value="progress" className="flex-1 min-w-[150px]">Progreso del Caso</TabsTrigger>
                            <TabsTrigger
                                value="financial"
                                className="flex-1 min-w-[150px]"
                                onClick={() => !invoice && !billingError && fetchBilling()}
                            >
                                Resumen Financiero
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab: Progreso del Caso */}
                        <TabsContent value="progress">
                            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
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
                                    <div className="text-center py-16 px-6">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin actualizaciones por ahora</h3>
                                        <p className="text-sm text-gray-600">Tu abogado registrará aquí todas las novedades del caso.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Tab: Resumen Financiero */}
                        <TabsContent value="financial">
                            {loadingBilling ? (
                                <div className="bg-white rounded-lg shadow-sm p-16 text-center">
                                    <p className="text-gray-600">Cargando información financiera...</p>
                                </div>
                            ) : billingError ? (
                                <div className="bg-white rounded-lg shadow-sm p-16 text-center">
                                    <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">{billingError}</h3>
                                </div>
                            ) : invoice ? (
                                <div className="space-y-6">
                                    {/* Cards de resumen */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="bg-white">
                                            <CardContent className="pt-6">
                                                <p className="text-sm text-gray-600 mb-2">Total Pagado</p>
                                                <p className="text-3xl font-bold text-gray-900">
                                                    ${totalPaid.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-white">
                                            <CardContent className="pt-6">
                                                <p className="text-sm text-gray-600 mb-2">Saldo Pendiente</p>
                                                <p className="text-3xl font-bold text-gray-900">
                                                    ${pendingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Lista de Transacciones */}
                                    {invoice.items && invoice.items.length > 0 && (
                                        <Card className="bg-white">
                                            <CardHeader>
                                                <CardTitle>Lista de Transacciones</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0 overflow-x-auto">
                                                <Table className="min-w-[600px]">
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Concepto</TableHead>
                                                            <TableHead>Fecha</TableHead>
                                                            <TableHead className="text-right">Monto</TableHead>
                                                            <TableHead className="text-right">Estado</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {invoice.items.map((item, index) => {
                                                            // Determinar el estado basado en los pagos
                                                            const itemTotal = item.quantity * item.price;
                                                            const isPaid = invoice.payments && invoice.payments.length > 0;
                                                            const status = isPaid ? "paid" : "pending";

                                                            return (
                                                                <TableRow key={index}>
                                                                    <TableCell className="font-medium">{item.description}</TableCell>
                                                                    <TableCell>
                                                                        {format(new Date(invoice.issue_date), "MMM dd, yyyy", { locale: es })}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        ${itemTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={`text-xs ${transactionStatusConfig[status]?.className || 'bg-gray-100 text-gray-800'}`}
                                                                        >
                                                                            {transactionStatusConfig[status]?.label || status}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm p-16 text-center">
                                    <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay información financiera</h3>
                                    <p className="text-sm text-gray-600">Haz clic en la pestaña para cargar la información.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </ProtectedRoute>
    );
}
