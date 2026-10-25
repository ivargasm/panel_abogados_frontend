"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/app/store/Store";
import {
    API_URL,
    getMyCaseDetails,
    getPortalCaseBilling,
    getPortalDocumentDownloadUrl,
} from "@/app/lib/api";
import ProtectedRoute from "@/app/components/ProtectedRoutes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    CheckCircle2,
    FileText,
    DollarSign,
    Download,
    Calendar,
    MapPin,
    Mail,
    Phone,
    Award,
    Building2,
    Scale,
    LogOut,
    Sun,
    Moon,
    Printer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ClientCaseDetail, CaseUpdate, Invoice, PortalDocument } from "@/app/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
    formatCurrencyMXN,
    getCaseStatusLabel,
    getCaseStatusStyle,
    INVOICE_STATUS_LABELS,
    PAYMENT_METHOD_LABELS,
} from "@/lib/legal-domain";

function formatBytes(bytes?: number): string {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const DetailPageSkeleton = () => (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-56 w-full" />
    </div>
);

const TimelineItem = ({ update, isLast }: { update: CaseUpdate; isLast: boolean }) => {
    const isCompleted = update.status === "Completado";

    return (
        <div className="relative flex items-start gap-x-4">
            {!isLast && (
                <div className="absolute left-5 top-11 -bottom-6 w-px bg-border" />
            )}

            <div
                className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${
                    isCompleted
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                        : "bg-primary/10 text-primary"
                }`}
            >
                {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                ) : (
                    <FileText className="h-5 w-5" />
                )}
            </div>

            <div className="flex-grow pb-2">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                        {format(new Date(update.created_at), "d 'de' MMMM 'de' yyyy", {
                            locale: es,
                        })}
                    </span>
                    <Badge variant="outline" className="text-[11px]">
                        {update.status}
                    </Badge>
                </div>
                <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap leading-relaxed">
                    {update.update_text}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5">
                    Registrado por {update.created_by.full_name}
                </p>
            </div>
        </div>
    );
};

export default function PortalCaseDetailPage() {
    const params = useParams();
    const { user, logout } = useAuthStore();
    const caseId = params.caseId as string;

    const [caseDetails, setCaseDetails] = useState<ClientCaseDetail | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [billingLoaded, setBillingLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingBilling, setLoadingBilling] = useState(false);
    const [billingError, setBillingError] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    useEffect(() => {
        if (!caseId) return;
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const data = await getMyCaseDetails(caseId, API_URL);
                setCaseDetails(data);
            } catch (err) {
                console.error("Error fetching case details:", err);
                toast.error("No se pudo cargar la información del expediente");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [caseId]);

    const fetchBilling = async () => {
        if (billingLoaded || loadingBilling) return;
        try {
            setLoadingBilling(true);
            setBillingError(null);
            const data = await getPortalCaseBilling(caseId, API_URL);
            setInvoices(data);
            setBillingLoaded(true);
        } catch (err) {
            setBillingError(
                err instanceof Error ? err.message : "No se pudo consultar el estado de cuenta."
            );
        } finally {
            setLoadingBilling(false);
        }
    };

    const handleDownloadDoc = async (doc: PortalDocument) => {
        setDownloadingId(doc.id);
        try {
            const { download_url } = await getPortalDocumentDownloadUrl(caseId, doc.id, API_URL);
            window.open(download_url, "_blank", "noopener,noreferrer");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo descargar el documento.");
        } finally {
            setDownloadingId(null);
        }
    };

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle("dark");
    };

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={["client"]}>
                <div className="bg-secondary/30 dark:bg-background min-h-screen">
                    <DetailPageSkeleton />
                </div>
            </ProtectedRoute>
        );
    }

    if (!caseDetails) {
        return (
            <ProtectedRoute allowedRoles={["client"]}>
                <div className="flex h-screen items-center justify-center text-center bg-background p-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Expediente no encontrado</h2>
                        <p className="text-muted-foreground text-sm">
                            No cuentas con permisos sobre este expediente o ya no se encuentra activo.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/portal-cliente">Volver a mis expedientes</Link>
                        </Button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const totalBilled = invoices.reduce((acc, inv) => acc + inv.amount, 0);
    const totalPending = invoices.reduce((acc, inv) => acc + inv.balance_due, 0);
    const totalPaid = Math.max(0, totalBilled - totalPending);

    return (
        <ProtectedRoute allowedRoles={["client"]}>
            <div className="bg-secondary/30 dark:bg-background min-h-screen flex flex-col">
                {/* Barra superior */}
                <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur print:hidden">
                    <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Scale className="h-5 w-5 text-primary shrink-0" />
                            <span className="font-bold text-sm sm:text-base truncate">
                                {caseDetails.workspace_name || user?.workspace_name || "Portal Jurídico"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.print()}
                                className="hidden sm:inline-flex"
                            >
                                <Printer className="h-4 w-4 mr-1.5" />
                                Imprimir Resumen
                            </Button>
                            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={logout}>
                                <LogOut className="h-4 w-4 mr-1.5" />
                                Salir
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto max-w-5xl px-4 py-6 sm:py-8 space-y-6 flex-1">
                    {/* Membrete para impresión */}
                    <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4 text-black">
                        <h1 className="text-lg font-bold uppercase">
                            {caseDetails.workspace_name || "Despacho Jurídico"}
                        </h1>
                        <p className="text-xs text-slate-600">
                            Reporte Informativo del Portal del Cliente • Emitido el{" "}
                            {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>
                    </div>

                    <Button asChild variant="ghost" size="sm" className="-ml-2 print:hidden">
                        <Link href="/portal-cliente">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a mis expedientes
                        </Link>
                    </Button>

                    {/* Carátula Procesal del Cliente */}
                    <Card className="print:shadow-none print:border-slate-300">
                        <CardHeader className="pb-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    {caseDetails.legal_matter && (
                                        <Badge variant="secondary">
                                            Materia {caseDetails.legal_matter}
                                        </Badge>
                                    )}
                                    {caseDetails.client_procedural_role && (
                                        <Badge variant="outline">
                                            Calidad: {caseDetails.client_procedural_role}
                                        </Badge>
                                    )}
                                </div>
                                <Badge
                                    variant="outline"
                                    className={getCaseStatusStyle(caseDetails.status)}
                                >
                                    {getCaseStatusLabel(caseDetails.status)}
                                </Badge>
                            </div>
                            <CardTitle className="text-2xl sm:text-3xl">
                                {caseDetails.title}
                            </CardTitle>
                            <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm">
                                {caseDetails.court_name && (
                                    <span className="flex items-center gap-1.5 text-foreground/80 font-medium">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        {caseDetails.court_name}
                                    </span>
                                )}
                                {caseDetails.judicial_file_number && (
                                    <span className="font-mono text-xs">
                                        Expediente Judicial: {caseDetails.judicial_file_number}
                                    </span>
                                )}
                                {caseDetails.case_number && (
                                    <span className="text-xs">
                                        Folio Interno: {caseDetails.case_number}
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {caseDetails.description && (
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {caseDetails.description}
                                </p>
                            )}

                            {caseDetails.assigned_lawyer && (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-11 w-11">
                                            <AvatarFallback className="bg-primary/15 text-primary font-bold">
                                                {getInitials(caseDetails.assigned_lawyer.full_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Abogado Responsable del Asunto
                                            </p>
                                            <p className="font-semibold text-foreground">
                                                {caseDetails.assigned_lawyer.full_name}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                {caseDetails.assigned_lawyer.job_title && (
                                                    <span>{caseDetails.assigned_lawyer.job_title}</span>
                                                )}
                                                {caseDetails.assigned_lawyer.professional_license && (
                                                    <span className="flex items-center gap-1 font-medium text-foreground/80">
                                                        <Award className="h-3.5 w-3.5 text-primary" />
                                                        Cédula Prof.{" "}
                                                        {caseDetails.assigned_lawyer.professional_license}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        {caseDetails.assigned_lawyer.email && (
                                            <a
                                                href={`mailto:${caseDetails.assigned_lawyer.email}`}
                                                className="flex items-center gap-1 hover:text-primary transition-colors"
                                            >
                                                <Mail className="h-3.5 w-3.5" />
                                                {caseDetails.assigned_lawyer.email}
                                            </a>
                                        )}
                                        {caseDetails.assigned_lawyer.phone_number && (
                                            <a
                                                href={`tel:${caseDetails.assigned_lawyer.phone_number}`}
                                                className="flex items-center gap-1 hover:text-primary transition-colors"
                                            >
                                                <Phone className="h-3.5 w-3.5" />
                                                {caseDetails.assigned_lawyer.phone_number}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pestañas del Portal */}
                    <Tabs defaultValue="progress" className="w-full">
                        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 print:hidden">
                            <TabsTrigger value="progress" className="flex-1 min-w-[140px]">
                                Avances ({caseDetails.updates.length})
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="flex-1 min-w-[150px]">
                                Documentos ({caseDetails.documents?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="events" className="flex-1 min-w-[150px]">
                                Audiencias ({caseDetails.upcoming_events?.length || 0})
                            </TabsTrigger>
                            {caseDetails.can_view_billing && (
                                <TabsTrigger
                                    value="financial"
                                    className="flex-1 min-w-[160px]"
                                    onClick={fetchBilling}
                                >
                                    Estado de Cuenta
                                </TabsTrigger>
                            )}
                        </TabsList>

                        {/* Pestaña 1: Avances */}
                        <TabsContent value="progress" className="mt-4">
                            <Card className="print:shadow-none print:border-slate-300">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Bitácora de Acuerdos y Actuaciones
                                    </CardTitle>
                                    <CardDescription>
                                        Novedades procesales compartidas por tu abogado
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {caseDetails.updates.length > 0 ? (
                                        <div className="space-y-6">
                                            {caseDetails.updates.map((update, index) => (
                                                <TimelineItem
                                                    key={update.id}
                                                    update={update}
                                                    isLast={index === caseDetails.updates.length - 1}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 px-4">
                                            <FileText className="mx-auto h-10 w-10 text-muted-foreground opacity-30 mb-3" />
                                            <h3 className="text-base font-medium mb-1">
                                                Sin actuaciones publicadas aún
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Cuando se emita un nuevo acuerdo o avance relevante en tu asunto, aparecerá aquí.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Pestaña 2: Documentos Compartidos */}
                        <TabsContent value="documents" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Expediente Digital Compartido
                                    </CardTitle>
                                    <CardDescription>
                                        Copias simples, acuses, acuerdos y promociones autorizadas para tu consulta
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {caseDetails.documents && caseDetails.documents.length > 0 ? (
                                        <div className="grid gap-3">
                                            {caseDetails.documents.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <FileText className="h-7 w-7 text-primary shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-sm truncate">
                                                                {doc.file_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Incorporado el{" "}
                                                                {format(
                                                                    new Date(doc.uploaded_at),
                                                                    "d 'de' MMMM, yyyy",
                                                                    { locale: es }
                                                                )}
                                                                {doc.file_size_bytes
                                                                    ? ` • ${formatBytes(doc.file_size_bytes)}`
                                                                    : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDownloadDoc(doc)}
                                                        disabled={downloadingId === doc.id}
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        {downloadingId === doc.id
                                                            ? "Abriendo..."
                                                            : "Descargar"}
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 px-4">
                                            <FileText className="mx-auto h-10 w-10 text-muted-foreground opacity-30 mb-3" />
                                            <h3 className="text-base font-medium mb-1">
                                                Sin documentos compartidos
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Los documentos que tu abogado habilite para tu descarga aparecerán en esta sección.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Pestaña 3: Próximas Audiencias y Citas */}
                        <TabsContent value="events" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Próximas Audiencias, Diligencias y Citas
                                    </CardTitle>
                                    <CardDescription>
                                        Fechas programadas en relación con tu expediente
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {caseDetails.upcoming_events &&
                                    caseDetails.upcoming_events.length > 0 ? (
                                        <div className="space-y-3">
                                            {caseDetails.upcoming_events.map((ev) => (
                                                <div
                                                    key={ev.id}
                                                    className="p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Badge variant="secondary">
                                                                {ev.event_type}
                                                            </Badge>
                                                            <span className="font-semibold text-sm">
                                                                {ev.title}
                                                            </span>
                                                        </div>
                                                        {ev.description && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {ev.description}
                                                            </p>
                                                        )}
                                                        {ev.location && (
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                                                {ev.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-medium flex items-center gap-1.5 text-primary shrink-0">
                                                        <Calendar className="h-4 w-4" />
                                                        {format(
                                                            new Date(ev.start_time),
                                                            "d 'de' MMM yyyy, HH:mm",
                                                            { locale: es }
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 px-4">
                                            <Calendar className="mx-auto h-10 w-10 text-muted-foreground opacity-30 mb-3" />
                                            <h3 className="text-base font-medium mb-1">
                                                Sin audiencias programadas próximamente
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Cualquier citación o audiencia señalada por el juzgado se mostrará aquí con anticipación.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Pestaña 4: Estado de Cuenta */}
                        {caseDetails.can_view_billing && (
                            <TabsContent value="financial" className="mt-4">
                                {loadingBilling ? (
                                    <Card className="p-12 text-center text-muted-foreground">
                                        Consultando estado de cuenta...
                                    </Card>
                                ) : billingError ? (
                                    <Card className="p-12 text-center">
                                        <DollarSign className="mx-auto h-10 w-10 text-muted-foreground opacity-30 mb-3" />
                                        <h3 className="text-base font-medium">{billingError}</h3>
                                    </Card>
                                ) : invoices.length > 0 ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                                        Honorarios Pactados
                                                    </p>
                                                    <p className="text-2xl font-bold mt-1">
                                                        {formatCurrencyMXN(totalBilled)}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                                        Total Abonado
                                                    </p>
                                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                                        {formatCurrencyMXN(totalPaid)}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="pt-6">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                                        Saldo Pendiente
                                                    </p>
                                                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
                                                        {formatCurrencyMXN(totalPending)}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {invoices.map((inv) => (
                                            <Card key={inv.id} className="print:shadow-none print:border-slate-300">
                                                <CardHeader className="pb-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div>
                                                            <CardTitle className="text-base">
                                                                Estado de Cuenta {inv.invoice_number}
                                                            </CardTitle>
                                                            <CardDescription>
                                                                Emitido el{" "}
                                                                {format(
                                                                    new Date(inv.issue_date),
                                                                    "d 'de' MMMM, yyyy",
                                                                    { locale: es }
                                                                )}
                                                                {inv.due_date
                                                                    ? ` • Vencimiento: ${format(
                                                                          new Date(inv.due_date),
                                                                          "d MMM yyyy",
                                                                          { locale: es }
                                                                      )}`
                                                                    : ""}
                                                            </CardDescription>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge
                                                                variant={
                                                                    inv.status === "paid"
                                                                        ? "default"
                                                                        : inv.status === "overdue"
                                                                        ? "destructive"
                                                                        : "secondary"
                                                                }
                                                            >
                                                                {INVOICE_STATUS_LABELS[inv.status] ||
                                                                    inv.status}
                                                            </Badge>
                                                            <span className="font-bold text-sm">
                                                                Saldo: {formatCurrencyMXN(inv.balance_due)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {inv.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {inv.description}
                                                        </p>
                                                    )}

                                                    {inv.items && inv.items.length > 0 && (
                                                        <div className="rounded-md border overflow-x-auto">
                                                            <Table className="min-w-[480px]">
                                                                <TableHeader className="bg-muted/40">
                                                                    <TableRow>
                                                                        <TableHead>Concepto</TableHead>
                                                                        <TableHead className="text-right">
                                                                            Cant.
                                                                        </TableHead>
                                                                        <TableHead className="text-right">
                                                                            Subtotal
                                                                        </TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {inv.items.map((item, idx) => (
                                                                        <TableRow key={idx}>
                                                                            <TableCell className="text-sm">
                                                                                {item.description}
                                                                            </TableCell>
                                                                            <TableCell className="text-right text-sm">
                                                                                {item.quantity}
                                                                            </TableCell>
                                                                            <TableCell className="text-right text-sm font-medium">
                                                                                {formatCurrencyMXN(
                                                                                    item.quantity *
                                                                                        item.price
                                                                                )}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    )}

                                                    {inv.payments && inv.payments.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                                                Abonos Registrados
                                                            </p>
                                                            <div className="rounded-md border overflow-x-auto">
                                                                <Table className="min-w-[480px]">
                                                                    <TableHeader className="bg-muted/40">
                                                                        <TableRow>
                                                                            <TableHead>Fecha</TableHead>
                                                                            <TableHead>Forma de Pago</TableHead>
                                                                            <TableHead>Referencia</TableHead>
                                                                            <TableHead className="text-right">
                                                                                Abono
                                                                            </TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {inv.payments.map((p) => (
                                                                            <TableRow key={p.id}>
                                                                                <TableCell className="text-sm">
                                                                                    {format(
                                                                                        new Date(
                                                                                            p.payment_date
                                                                                        ),
                                                                                        "d MMM yyyy",
                                                                                        { locale: es }
                                                                                    )}
                                                                                </TableCell>
                                                                                <TableCell className="text-sm">
                                                                                    {PAYMENT_METHOD_LABELS[
                                                                                        p.method
                                                                                    ] || p.method}
                                                                                </TableCell>
                                                                                <TableCell className="text-sm text-muted-foreground">
                                                                                    {p.notes || "-"}
                                                                                </TableCell>
                                                                                <TableCell className="text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                                                    {formatCurrencyMXN(
                                                                                        p.amount
                                                                                    )}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="p-12 text-center">
                                        <DollarSign className="mx-auto h-10 w-10 text-muted-foreground opacity-30 mb-3" />
                                        <h3 className="text-base font-medium mb-1">
                                            Sin estados de cuenta registrados en este asunto
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            No existen saldos pendientes asociados a este expediente.
                                        </p>
                                    </Card>
                                )}
                            </TabsContent>
                        )}
                    </Tabs>
                </main>
            </div>
        </ProtectedRoute>
    );
}
