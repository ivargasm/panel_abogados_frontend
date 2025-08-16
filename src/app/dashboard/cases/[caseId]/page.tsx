"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Eye, EyeOff, Edit, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

// Lógica de negocio y tipos
import { useAuthStore } from '@/app/store/Store';
import { getCaseById, getCaseUpdates, createCaseUpdate, updateCaseUpdateStatus, updateCaseUpdate } from '@/app/lib/api';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import ClientPortalCard from './components/ClientPortalCard';
import DocumentsCard from './components/DocumentsCard';
import type { Case, CaseUpdate, CaseUpdateData, UpdateStatus } from '@/app/types';

const ALL_STATUSES: UpdateStatus[] = ["Pendiente", "En Proceso", "Completado", "Cancelado"];

// --- Componente Modal para Editar Actualización (sin cambios) ---
function EditUpdateModal({ update, isOpen, onClose, onSave }: { update: CaseUpdate | null, isOpen: boolean, onClose: () => void, onSave: (updateId: number, data: CaseUpdateData) => void }) {
    const [text, setText] = useState('');
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
            await onSave(update.id, { update_text: text, visible_to_client: isVisible, status: update.status });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Avance</DialogTitle>
                    <DialogDescription>Modifica el contenido del avance del caso.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} disabled={isSubmitting} />
                    <div className="flex items-center space-x-2">
                        <Checkbox id="edit_visible_to_client" checked={isVisible} onCheckedChange={(checked) => setIsVisible(Boolean(checked))} disabled={isSubmitting} />
                        <Label htmlFor="edit_visible_to_client">Visible para el cliente</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting || !text.trim()}>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Componente para el Formulario de Nueva Actualización (sin cambios) ---
function NewUpdateForm({ caseId, onUpdateCreated }: { caseId: number, onUpdateCreated: (newUpdate: CaseUpdate) => void }) {
    const [text, setText] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { url } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        setIsSubmitting(true);
        const updateData: CaseUpdateData = { update_text: text, visible_to_client: isVisible, status: "Pendiente" };
        try {
            const newUpdate = await createCaseUpdate(caseId, updateData, url);
            onUpdateCreated(newUpdate);
            toast.success("Avance añadido correctamente.");
            setText('');
            setIsVisible(false);
        } catch {
            toast.error("Error al crear la actualización.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea placeholder="Añade una nueva actualización, nota o avance del caso..." value={text} onChange={(e) => setText(e.target.value)} rows={4} disabled={isSubmitting} />
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Checkbox id="visible_to_client" checked={isVisible} onCheckedChange={(checked) => setIsVisible(Boolean(checked))} disabled={isSubmitting} />
                    <Label htmlFor="visible_to_client">Visible para el cliente</Label>
                </div>
                <Button type="submit" disabled={isSubmitting || !text.trim()}>{isSubmitting ? 'Guardando...' : 'Añadir Avance'}</Button>
            </div>
        </form>
    );
}

// --- Componente de la Línea de Tiempo (TOTALMENTE REDISEÑADO) ---
function TimelineItem({ update, onStatusChange, onEdit }: { update: CaseUpdate, onStatusChange: (id: number, status: UpdateStatus) => void, onEdit: (update: CaseUpdate) => void }) {
    return (
        <div className="grid grid-cols-[auto_1fr] gap-x-4">
            {/* Columna del Ícono */}
            <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <MessageSquare className="h-5 w-5 text-slate-500" />
                </div>
            </div>

            {/* Columna del Contenido */}
            <div className="flex flex-col space-y-2">
                {/* Cabecera con autor y menú de acciones */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{update.created_by.full_name}</p>
                        <time className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
                            {format(new Date(update.created_at), "d LLL yyyy, h:mm a", { locale: es })}
                        </time>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => onEdit(update)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {ALL_STATUSES.map(status => (
                                <DropdownMenuItem key={status} onSelect={() => onStatusChange(update.id, status)} disabled={update.status === status}>
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Contenido del avance */}
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap pr-4">
                    {update.update_text}
                </p>

                {/* Pie de la tarjeta con estatus y visibilidad */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Badge variant={update.status === 'Completado' ? 'default' : (update.status === 'Cancelado' ? 'destructive' : 'secondary')}>
                        {update.status}
                    </Badge>
                    <Badge variant={update.visible_to_client ? 'outline' : 'secondary'} className="border-dashed">
                        {update.visible_to_client ? <Eye className="mr-1.5 h-3 w-3" /> : <EyeOff className="mr-1.5 h-3 w-3" />}
                        {update.visible_to_client ? 'Visible' : 'Interno'}
                    </Badge>
                    <time className="block sm:hidden text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(update.created_at), "d LLL yyyy, h:mm a", { locale: es })}
                    </time>
                </div>
            </div>
        </div>
    );
}


// --- Componente Principal de la Página de Detalle ---
export default function CaseDetailPage() {
    const router = useRouter();
    const params = useParams();
    const caseId = Number(params.caseId);

    const [caseDetails, setCaseDetails] = useState<Case | null>(null);
    const [updates, setUpdates] = useState<CaseUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingUpdate, setEditingUpdate] = useState<CaseUpdate | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { url } = useAuthStore();

    const fetchCaseData = useCallback(async () => {
        if (isNaN(caseId)) { setError("ID de caso inválido."); setLoading(false); return; }
        try {
            setLoading(true);
            const [detailsData, updatesData] = await Promise.all([getCaseById(caseId, url), getCaseUpdates(caseId, url)]);
            setCaseDetails(detailsData);
            setUpdates(updatesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar los datos del caso.");
        } finally {
            setLoading(false);
        }
    }, [caseId, url]);

    useEffect(() => { fetchCaseData(); }, [fetchCaseData]);

    const handleUpdateCreated = (newUpdate: CaseUpdate) => { setUpdates(prev => [newUpdate, ...prev]); };

    const handleStatusChange = async (updateId: number, newStatus: UpdateStatus) => {
        const originalUpdates = [...updates];
        const updateIndex = originalUpdates.findIndex(u => u.id === updateId);
        if (updateIndex === -1 || originalUpdates[updateIndex].status === newStatus) return;
        const updatedUpdates = [...originalUpdates];
        updatedUpdates[updateIndex] = { ...updatedUpdates[updateIndex], status: newStatus };
        setUpdates(updatedUpdates);
        try {
            await updateCaseUpdateStatus(updateId, { status: newStatus }, url);
            toast.success("Estatus actualizado.");
        } catch (err) {
            setUpdates(originalUpdates);
            toast.error(err instanceof Error ? err.message : "No se pudo actualizar.");
        }
    };

    const handleEditUpdate = (update: CaseUpdate) => { setEditingUpdate(update); setIsEditModalOpen(true); };

    const handleSaveEdit = async (updateId: number, updateData: CaseUpdateData) => {
        const originalUpdates = [...updates];
        const updateIndex = originalUpdates.findIndex(u => u.id === updateId);
        if (updateIndex === -1) return;
        const updatedUpdates = [...originalUpdates];
        updatedUpdates[updateIndex] = { ...updatedUpdates[updateIndex], ...updateData };
        setUpdates(updatedUpdates);
        try {
            await updateCaseUpdate(updateId, updateData, url);
            toast.success("Avance modificado correctamente.");
        } catch (err) {
            setUpdates(originalUpdates);
            toast.error(err instanceof Error ? err.message : "No se pudo modificar.");
        }
    };

    if (loading) { return <div>Cargando...</div>; }
    if (error) { return <div className="text-center text-destructive">{error}</div>; }
    if (!caseDetails) { return <div className="text-center text-muted-foreground">No se encontraron los detalles del caso.</div>; }

    return (
        <ProtectedRoute allowedRoles={['owner', 'lawyer']}>
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => router.push('/dashboard/cases')} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button>
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">{caseDetails.title}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                        <span>Cliente: <span className="font-semibold text-foreground">{caseDetails.client.full_name}</span></span>
                        <span className="hidden md:inline">|</span>
                        <span>Expediente: <span className="font-semibold text-foreground">{caseDetails.case_number || 'N/A'}</span></span>
                        <span className="hidden md:inline">|</span>
                        <Badge variant="outline">{caseDetails.status}</Badge>
                    </div>
                </header>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card><CardHeader><CardTitle>Añadir Avance</CardTitle></CardHeader><CardContent><NewUpdateForm caseId={caseId} onUpdateCreated={handleUpdateCreated} /></CardContent></Card>
                        <Card>
                            <CardHeader><CardTitle>Línea de Tiempo</CardTitle><CardDescription>Historial de avances del caso.</CardDescription></CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {updates.map((update) => (
                                        <TimelineItem key={update.id} update={update} onStatusChange={handleStatusChange} onEdit={handleEditUpdate} />
                                    ))}
                                    {updates.length === 0 && <p className="text-center text-muted-foreground py-8">No hay avances todavía. ¡Añade el primero!</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <DocumentsCard caseId={caseId} />
                        <ClientPortalCard caseDetails={caseDetails} />
                    </div>
                </div>
                <EditUpdateModal update={editingUpdate} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveEdit} />
            </div>
        </ProtectedRoute>
    );
}
