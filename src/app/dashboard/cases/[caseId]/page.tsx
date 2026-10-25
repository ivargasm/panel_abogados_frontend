"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    MessageSquare,
    Eye,
    EyeOff,
    Edit,
    MoreVertical,
    Trash2,
    Printer,
    Scale,
    Award,
    Building2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useAuthStore } from "@/app/store/Store";
import {
    API_URL,
    getCaseById,
    getCaseUpdates,
    createCaseUpdate,
    updateCaseUpdateStatus,
    updateCaseUpdate,
    deleteCaseUpdate,
    updateCaseStatus,
} from "@/app/lib/api";
import DocumentsCard from "./components/DocumentsCard";
import type { Case, CaseUpdate, CaseUpdateData, UpdateStatus } from "@/app/types";
import {
    CASE_STATUS_OPTIONS,
    getCaseStatusLabel,
    getCaseStatusStyle,
} from "@/lib/legal-domain";

const ALL_STATUSES: UpdateStatus[] = ["Pendiente", "En Proceso", "Completado", "Cancelado"];

function EditUpdateModal({
    update,
    isOpen,
    onClose,
    onSave,
}: {
    update: CaseUpdate | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updateId: number, data: CaseUpdateData) => Promise<void>;
}) {
    const [text, setText] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (update) {
            setText(update.update_text);
            setIsVisible(update.visible_to_client);
        }
    }, [update]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!update || !text.trim()) return;
        setIsSubmitting(true);
        try {
            await onSave(update.id, {
                update_text: text,
                visible_to_client: isVisible,
                status: update.status,
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Actuación Procesal</DialogTitle>
                    <DialogDescription>
                        Modifica la redacción del acuerdo o diligencia y define si es visible para el representado.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={5}
                        disabled={isSubmitting}
                    />
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="edit_visible_to_client"
                            checked={isVisible}
                            onCheckedChange={(checked) => setIsVisible(Boolean(checked))}
                            disabled={isSubmitting}
                        />
                        <Label htmlFor="edit_visible_to_client">
                            Mostrar en el Portal del Cliente
                        </Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !text.trim()}>
                            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function NewUpdateForm({
    caseId,
    onUpdateCreated,
}: {
    caseId: number;
    onUpdateCreated: (newUpdate: CaseUpdate) => void;
}) {
    const [text, setText] = useState("");
    const [isVisible, setIsVisible] = useState(true);
    const [status, setStatus] = useState<UpdateStatus>("En Proceso");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        setIsSubmitting(true);
        const updateData: CaseUpdateData = {
            update_text: text.trim(),
            visible_to_client: isVisible,
            status,
        };
        try {
            const newUpdate = await createCaseUpdate(caseId, updateData, API_URL);
            onUpdateCreated(newUpdate);
            toast.success("Actuación registrada en la bitácora del expediente.");
            setText("");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al registrar la actuación.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
                placeholder="Registra un acuerdo publicado en boletín judicial, promoción presentada, razón actuarial o diligencia..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                disabled={isSubmitting}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="visible_to_client"
                            checked={isVisible}
                            onCheckedChange={(checked) => setIsVisible(Boolean(checked))}
                            disabled={isSubmitting}
                        />
                        <Label htmlFor="visible_to_client" className="cursor-pointer text-sm">
                            Visible para el cliente
                        </Label>
                    </div>
                    <Select
                        value={status}
                        onValueChange={(v: UpdateStatus) => setStatus(v)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-[150px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ALL_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit" disabled={isSubmitting || !text.trim()}>
                    {isSubmitting ? "Registrando..." : "Registrar Actuación"}
                </Button>
            </div>
        </form>
    );
}

function TimelineItem({
    update,
    onStatusChange,
    onEdit,
    onDelete,
}: {
    update: CaseUpdate;
    onStatusChange: (id: number, status: UpdateStatus) => void;
    onEdit: (update: CaseUpdate) => void;
    onDelete: (id: number) => void;
}) {
    return (
        <div className="grid grid-cols-[auto_1fr] gap-x-4">
            <div className="flex flex-col items-center print:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-4 w-4 text-primary" />
                </div>
            </div>

            <div className="flex flex-col space-y-2 border-b pb-5 last:border-b-0">
                <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm text-foreground">
                            {update.created_by.full_name}
                        </p>
                        <time className="text-xs text-muted-foreground">
                            • {format(new Date(update.created_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
                        </time>
                    </div>
                    <div className="print:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => onEdit(update)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Editar redacción</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {ALL_STATUSES.map((status) => (
                                    <DropdownMenuItem
                                        key={status}
                                        onSelect={() => onStatusChange(update.id, status)}
                                        disabled={update.status === status}
                                    >
                                        Marcar como {status}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={() => onDelete(update.id)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Eliminar actuación</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <p className="text-sm text-foreground/90 whitespace-pre-wrap pr-2">
                    {update.update_text}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge
                        variant={
                            update.status === "Completado"
                                ? "default"
                                : update.status === "Cancelado"
                                ? "destructive"
                                : "secondary"
                        }
                    >
                        {update.status}
                    </Badge>
                    <Badge variant="outline" className="border-dashed print:hidden">
                        {update.visible_to_client ? (
                            <Eye className="mr-1.5 h-3 w-3 text-emerald-600" />
                        ) : (
                            <EyeOff className="mr-1.5 h-3 w-3" />
                        )}
                        {update.visible_to_client ? "Visible en Portal del Cliente" : "Uso Interno del Despacho"}
                    </Badge>
                </div>
            </div>
        </div>
    );
}

export default function CaseDetailPage() {
    const router = useRouter();
    const params = useParams();
    const caseId = Number(params.caseId);
    const { user } = useAuthStore();

    const [caseDetails, setCaseDetails] = useState<Case | null>(null);
    const [updates, setUpdates] = useState<CaseUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingUpdate, setEditingUpdate] = useState<CaseUpdate | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchCaseData = useCallback(async () => {
        if (Number.isNaN(caseId)) {
            setError("Identificador de expediente inválido.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const [detailsData, updatesData] = await Promise.all([
                getCaseById(caseId, API_URL),
                getCaseUpdates(caseId, API_URL),
            ]);
            setCaseDetails(detailsData);
            setUpdates(updatesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar el expediente.");
        } finally {
            setLoading(false);
        }
    }, [caseId]);

    useEffect(() => {
        fetchCaseData();
    }, [fetchCaseData]);

    const handleUpdateCreated = (newUpdate: CaseUpdate) => {
        setUpdates((prev) => [newUpdate, ...prev]);
    };

    const handleCaseStageChange = async (newStage: string) => {
        if (!caseDetails) return;
        try {
            const updated = await updateCaseStatus(caseDetails.id, newStage, API_URL);
            setCaseDetails(updated);
            toast.success("Etapa procesal actualizada");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo actualizar la etapa procesal");
        }
    };

    const handleStatusChange = async (updateId: number, newStatus: UpdateStatus) => {
        const originalUpdates = [...updates];
        const updateIndex = originalUpdates.findIndex((u) => u.id === updateId);
        if (updateIndex === -1 || originalUpdates[updateIndex].status === newStatus) return;
        const updatedUpdates = [...originalUpdates];
        updatedUpdates[updateIndex] = { ...updatedUpdates[updateIndex], status: newStatus };
        setUpdates(updatedUpdates);
        try {
            await updateCaseUpdateStatus(updateId, { status: newStatus }, API_URL);
            toast.success("Estatus de la actuación actualizado.");
        } catch (err) {
            setUpdates(originalUpdates);
            toast.error(err instanceof Error ? err.message : "No se pudo actualizar.");
        }
    };

    const handleEditUpdate = (update: CaseUpdate) => {
        setEditingUpdate(update);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (updateId: number, updateData: CaseUpdateData) => {
        const originalUpdates = [...updates];
        const updateIndex = originalUpdates.findIndex((u) => u.id === updateId);
        if (updateIndex === -1) return;
        const updatedUpdates = [...originalUpdates];
        updatedUpdates[updateIndex] = { ...updatedUpdates[updateIndex], ...updateData };
        setUpdates(updatedUpdates);
        try {
            await updateCaseUpdate(updateId, updateData, API_URL);
            toast.success("Actuación modificada correctamente.");
        } catch (err) {
            setUpdates(originalUpdates);
            toast.error(err instanceof Error ? err.message : "No se pudo modificar.");
        }
    };

    const handleDeleteUpdate = async (updateId: number) => {
        try {
            await deleteCaseUpdate(updateId, API_URL);
            setUpdates((prev) => prev.filter((u) => u.id !== updateId));
            toast.success("Actuación eliminada.");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo eliminar la actuación.");
        }
    };

    if (loading) {
        return <div className="p-8 text-muted-foreground">Cargando expediente...</div>;
    }
    if (error) {
        return <div className="p-8 text-center text-destructive">{error}</div>;
    }
    if (!caseDetails) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                No se encontraron los datos del expediente.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Membrete Oficial exclusivo para Impresión / Carátula PDF */}
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
                            Carátula Procesal y Reporte de Seguimiento de Expediente
                        </p>
                    </div>
                    <div className="text-right text-xs text-slate-600">
                        <p className="font-bold text-slate-900 text-sm">
                            {caseDetails.judicial_file_number
                                ? `EXPEDIENTE JUDICIAL: ${caseDetails.judicial_file_number}`
                                : `CONTROL INTERNO: ${caseDetails.case_number || caseDetails.id}`}
                        </p>
                        <p>
                            Emitido el {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navegación superior */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/dashboard/cases")}
                    className="w-fit"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Expedientes
                </Button>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={caseDetails.status} onValueChange={handleCaseStageChange}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CASE_STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir Carátula / PDF
                    </Button>
                </div>
            </div>

            {/* Carátula Procesal Mexicana */}
            <Card className="print:shadow-none print:border-slate-400">
                <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {caseDetails.legal_matter && (
                                <Badge variant="secondary">Materia {caseDetails.legal_matter}</Badge>
                            )}
                            <Badge
                                variant="outline"
                                className={getCaseStatusStyle(caseDetails.status)}
                            >
                                {getCaseStatusLabel(caseDetails.status)}
                            </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Radicado el{" "}
                            {format(new Date(caseDetails.created_at), "d 'de' MMMM, yyyy", {
                                locale: es,
                            })}
                        </span>
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl pt-1">
                        {caseDetails.title}
                    </CardTitle>
                    {caseDetails.court_name && (
                        <CardDescription className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                            <Building2 className="h-4 w-4 text-primary shrink-0" />
                            {caseDetails.court_name}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/40 border text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                Representado
                            </p>
                            <p className="font-semibold mt-0.5">{caseDetails.client.full_name}</p>
                            {caseDetails.client_procedural_role && (
                                <p className="text-xs text-primary font-medium">
                                    {caseDetails.client_procedural_role}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                Contraparte
                            </p>
                            <p className="font-semibold mt-0.5">
                                {caseDetails.opposing_party || "Sin contraparte registrada"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                Identificación del Expediente
                            </p>
                            <p className="font-semibold mt-0.5">
                                Jud: {caseDetails.judicial_file_number || "En asignación"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Interno: {caseDetails.case_number || `#${caseDetails.id}`}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                Abogado Responsable
                            </p>
                            <p className="font-semibold mt-0.5">
                                {caseDetails.assigned_lawyer?.full_name || user?.full_name}
                            </p>
                            {caseDetails.assigned_lawyer?.professional_license && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Award className="h-3 w-3" />
                                    Cédula: {caseDetails.assigned_lawyer.professional_license}
                                </p>
                            )}
                        </div>
                    </div>

                    {caseDetails.description && (
                        <div className="mt-4 text-sm">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                Síntesis de Pretensiones y Estado Procesal
                            </p>
                            <p className="text-foreground/90 whitespace-pre-wrap">
                                {caseDetails.description}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6 print:col-span-3">
                    <Card className="print:hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Registrar Nueva Actuación</CardTitle>
                            <CardDescription>
                                Añade acuerdos, promociones o diligencias y elige si deseas notificar al cliente en su portal.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NewUpdateForm caseId={caseId} onUpdateCreated={handleUpdateCreated} />
                        </CardContent>
                    </Card>

                    <Card className="print:shadow-none print:border-slate-400">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Bitácora Cronológica de Actuaciones
                            </CardTitle>
                            <CardDescription>
                                Historial de acuerdos, promociones y seguimiento del asunto ({updates.length})
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-5">
                                {updates.map((update) => (
                                    <TimelineItem
                                        key={update.id}
                                        update={update}
                                        onStatusChange={handleStatusChange}
                                        onEdit={handleEditUpdate}
                                        onDelete={handleDeleteUpdate}
                                    />
                                ))}
                                {updates.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8 text-sm">
                                        Aún no existen actuaciones registradas en este expediente.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6 print:hidden">
                    <DocumentsCard caseId={caseId} />
                </div>
            </div>

            <EditUpdateModal
                update={editingUpdate}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveEdit}
            />
        </div>
    );
}
