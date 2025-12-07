// app/dashboard/cases/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FileText, MessageSquare, CheckSquare, Briefcase, User as UserIcon, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importaciones de componentes de shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


// Importaciones de tu lógica de negocio
import { useAuthStore } from '@/app/store/Store';
import { getCases, createCase, getClients, updateCase, deleteCase, getCaseUpdates, getDocumentsForCase, createCaseUpdate } from '@/app/lib/api';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import { CaseData, CaseUpdateData } from '@/app/types';
import type { CaseUpdate, Document } from '@/app/types';

// Tipos
type Client = {
    id: number;
    full_name: string;
};

type Case = {
    id: number;
    title: string;
    case_number: string | null;
    description: string | null;
    status: string;
    created_at: string;
    client: Client;
};

// --- Componente del Formulario para Crear/Editar Caso ---
function CaseForm({ caseItem, clients, onSave, onFinish }: { caseItem: Partial<Case> | null, clients: Client[], onSave: (caseData: CaseData) => Promise<void>, onFinish: () => void }) {
    const [caseData, setCaseData] = useState({
        title: '',
        case_number: '',
        description: '',
        client_id: ''
    });

    useEffect(() => {
        if (caseItem) {
            setCaseData({
                title: caseItem.title || '',
                case_number: caseItem.case_number || '',
                description: caseItem.description || '',
                client_id: String(caseItem.client?.id || '')
            });
        } else {
            setCaseData({ title: '', case_number: '', description: '', client_id: '' });
        }
    }, [caseItem]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCaseData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!caseData.client_id) {
            toast.error("Por favor, selecciona un cliente.");
            return;
        }
        await onSave({ ...caseData, client_id: parseInt(caseData.client_id) });
        onFinish();
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="title">Título del Caso</Label>
                <Input id="title" name="title" value={caseData.title} onChange={handleInputChange} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="case_number">No. Expediente</Label>
                <Input id="case_number" name="case_number" value={caseData.case_number} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="client_id">Cliente</Label>
                <Select onValueChange={(value) => setCaseData(prev => ({ ...prev, client_id: value }))} value={caseData.client_id}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                        {clients.map(client => (
                            <SelectItem key={client.id} value={String(client.id)}>
                                {client.full_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" name="description" value={caseData.description} onChange={handleInputChange} />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onFinish}>Cancelar</Button>
                <Button type="submit">Guardar Caso</Button>
            </DialogFooter>
        </form>
    );
}

// --- Componente del Formulario para Crear Actualización ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function UpdateForm({ caseId, onSave, onFinish }: { caseId: number, onSave: (updateData: CaseUpdateData) => Promise<void>, onFinish: () => void }) {
    const [updateData, setUpdateData] = useState<CaseUpdateData>({
        update_text: '',
        visible_to_client: false,
        status: 'Pendiente'
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await onSave(updateData);
        onFinish();
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="update_text">Descripción de la Actualización</Label>
                <Input
                    id="update_text"
                    value={updateData.update_text}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, update_text: e.target.value }))}
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                    value={updateData.status}
                    onValueChange={(value: CaseUpdateData['status']) => setUpdateData(prev => ({ ...prev, status: value }))}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="En Proceso">En Proceso</SelectItem>
                        <SelectItem value="Completado">Completado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="visible_to_client"
                    checked={updateData.visible_to_client}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, visible_to_client: e.target.checked }))}
                    className="h-4 w-4"
                />
                <Label htmlFor="visible_to_client" className="cursor-pointer">
                    Visible para el cliente
                </Label>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onFinish}>Cancelar</Button>
                <Button type="submit">Crear Actualización</Button>
            </DialogFooter>
        </form>
    );
}

// --- Componente Timeline ---
function Timeline({ caseItem, updates, documents }: { caseItem: Case, updates: CaseUpdate[], documents: Document[] }) {
    // Combinar todos los eventos y ordenarlos por fecha
    const events = [
        {
            type: 'created',
            date: caseItem.created_at,
            title: 'Caso Creado',
            description: `Caso iniciado`,
            icon: Briefcase
        },
        ...updates.map(update => ({
            type: 'update',
            date: update.created_at,
            title: 'Actualización del Caso',
            description: update.update_text,
            icon: CheckSquare,
            status: update.status
        })),
        ...documents.map(doc => ({
            type: 'document',
            date: doc.uploaded_at,
            title: 'Documento Subido',
            description: doc.file_name,
            icon: FileText
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            {events.map((event, index) => {
                const Icon = event.icon;
                return (
                    <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`rounded-full p-2 ${event.type === 'created' ? 'bg-primary/10 text-primary' :
                                event.type === 'update' ? 'bg-blue-500/10 text-blue-500' :
                                    'bg-green-500/10 text-green-500'
                                }`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            {index < events.length - 1 && (
                                <div className="w-px h-full bg-border mt-2" />
                            )}
                        </div>
                        <div className="flex-1 pb-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold">{event.title}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                                    {'status' in event && event.status && (
                                        <Badge variant="outline" className="mt-2">{event.status}</Badge>
                                    )}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {format(new Date(event.date), "d 'de' MMM, yyyy", { locale: es })}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// --- Componente Principal ---
export default function CasesPage() {
    const [cases, setCases] = useState<Case[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [editingCase, setEditingCase] = useState<Case | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [clientFilter, setClientFilter] = useState<string>('all');

    // Estados para detalles del caso
    const [caseUpdates, setCaseUpdates] = useState<CaseUpdate[]>([]);
    const [caseDocuments, setCaseDocuments] = useState<Document[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const { url } = useAuthStore();
    const router = useRouter();

    // Cargar casos y clientes
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [casesData, clientsData] = await Promise.all([
                    getCases(url, null),
                    getClients(url)
                ]);
                setCases(casesData);
                setClients(clientsData);
                if (casesData.length > 0 && !selectedCase) {
                    setSelectedCase(casesData[0]);
                }
            } catch {
                toast.error('Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    // Cargar detalles del caso seleccionado
    useEffect(() => {
        if (!selectedCase) return;

        const fetchCaseDetails = async () => {
            setLoadingDetails(true);
            try {
                const [updates, documents] = await Promise.all([
                    getCaseUpdates(selectedCase.id, url),
                    getDocumentsForCase(selectedCase.id, url)
                ]);
                setCaseUpdates(updates);
                setCaseDocuments(documents);
            } catch (err) {
                console.error('Error al cargar detalles del caso:', err);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchCaseDetails();
    }, [selectedCase, url]);

    const handleSaveCase = async (caseData: CaseData) => {
        try {
            if (editingCase) {
                const updated = await updateCase(editingCase.id, caseData, url);
                setCases(prev => prev.map(c => c.id === editingCase.id ? updated : c));
                if (selectedCase?.id === editingCase.id) {
                    setSelectedCase(updated);
                }
                toast.success('Caso actualizado');
            } else {
                const created = await createCase(caseData, url);
                setCases(prev => [...prev, created]);
                setSelectedCase(created);
                toast.success('Caso creado');
            }
            const refreshedCases = await getCases(url, null);
            setCases(refreshedCases);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al guardar caso');
        }
    };

    const handleCreateUpdate = async (updateData: CaseUpdateData) => {
        if (!selectedCase) return;
        try {
            await createCaseUpdate(selectedCase.id, updateData, url);
            const updates = await getCaseUpdates(selectedCase.id, url);
            setCaseUpdates(updates);
            toast.success('Actualización creada');
        } catch {
            toast.error('Error al crear actualización');
        }
    };

    const handleDeleteCase = async (caseId: number) => {
        try {
            await deleteCase(caseId, url);
            const newCases = cases.filter(c => c.id !== caseId);
            setCases(newCases);
            if (selectedCase?.id === caseId) {
                setSelectedCase(newCases[0] || null);
            }
            toast.success("Caso eliminado");
        } catch {
            toast.error('No se pudo eliminar el caso');
        }
    };

    // Filtrado de casos
    const filteredCases = React.useMemo(() => {
        return cases.filter(caseItem => {
            const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                caseItem.client.full_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
            const matchesClient = clientFilter === 'all' || String(caseItem.client.id) === clientFilter;
            return matchesSearch && matchesStatus && matchesClient;
        });
    }, [cases, searchTerm, statusFilter, clientFilter]);

    // Efecto para actualizar la selección cuando cambian los filtros
    useEffect(() => {
        if (filteredCases.length > 0) {
            const isSelectedInList = selectedCase && filteredCases.some(c => c.id === selectedCase.id);
            if (selectedCase && !isSelectedInList) {
                setSelectedCase(null);
            }
        } else {
            setSelectedCase(null);
        }
    }, [filteredCases, selectedCase]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'default';
            case 'discovery': return 'secondary';
            case 'trial': return 'destructive';
            case 'closed': return 'outline';
            case 'on_hold': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex flex-col gap-4 h-full lg:h-[calc(100vh-2rem)]">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Casos</h1>
                        <p className="text-muted-foreground">Gestiona todos los casos de tu despacho.</p>
                    </div>
                    <Button onClick={() => { setEditingCase(null); setIsModalOpen(true); }} className="shrink-0">
                        <Plus className="h-4 w-4 mr-2" /> Añadir Caso
                    </Button>
                </div>

                {/* Búsqueda y Filtros */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre de caso o cliente..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Estados</SelectItem>
                                <SelectItem value="active">Activo</SelectItem>
                                <SelectItem value="discovery">Descubrimiento</SelectItem>
                                <SelectItem value="trial">Juicio</SelectItem>
                                <SelectItem value="on_hold">En Espera</SelectItem>
                                <SelectItem value="closed">Cerrado</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={clientFilter} onValueChange={setClientFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Clientes</SelectItem>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={String(client.id)}>
                                        {client.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Layout de dos paneles */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
                    {/* Panel Izquierdo - Lista de Casos */}
                    <Card className={`lg:col-span-5 flex flex-col h-[500px] lg:h-full min-h-0 ${selectedCase ? 'hidden lg:flex' : 'flex'}`}>
                        <CardHeader className="pb-3">
                            <CardTitle>Lista de Casos</CardTitle>
                            <CardDescription>{filteredCases.length} caso{filteredCases.length !== 1 ? 's' : ''}</CardDescription>
                        </CardHeader>
                        <div className="flex-1 min-h-0">
                            <ScrollArea className="h-full">
                                <div className="divide-y px-4">
                                    {filteredCases.map((caseItem) => (
                                        <div
                                            key={caseItem.id}
                                            className={`py-4 cursor-pointer hover:bg-accent/50 transition-colors px-3 -mx-3 rounded-md ${selectedCase?.id === caseItem.id ? 'bg-accent' : ''
                                                }`}
                                            onClick={() => setSelectedCase(caseItem)}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold truncate">{caseItem.title}</p>
                                                        <Badge variant={getStatusColor(caseItem.status)} className="shrink-0">
                                                            {caseItem.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {caseItem.client.full_name}
                                                    </p>
                                                    {caseItem.case_number && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Caso #{caseItem.case_number}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="lg:hidden self-center">
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                {selectedCase?.id === caseItem.id && (
                                                    <div className="hidden lg:block w-1 h-12 bg-primary rounded-full" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {filteredCases.length === 0 && (
                                        <div className="py-12 text-center text-muted-foreground">
                                            No se encontraron casos
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </Card>

                    {/* Panel Derecho - Detalles del Caso */}
                    <Card className={`lg:col-span-7 flex flex-col h-full min-h-0 ${selectedCase ? 'flex' : 'hidden lg:flex'}`}>
                        {selectedCase ? (
                            <div className="flex flex-col h-full">
                                {/* Header del Caso */}
                                <div className="p-4 sm:p-6 border-b">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setSelectedCase(null)}>
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <div className="min-w-0">
                                                    <h2 className="text-xl sm:text-2xl font-bold truncate">{selectedCase.title}</h2>
                                                    {selectedCase.case_number && (
                                                        <p className="text-muted-foreground text-sm">Caso #{selectedCase.case_number}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <Button variant="outline" size="icon" onClick={() => { setEditingCase(selectedCase); setIsModalOpen(true); }}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="icon">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Eliminar caso?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción marcará el caso como inactivo.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteCase(selectedCase.id)}>
                                                                Eliminar
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                        <Button className="w-full sm:w-auto" onClick={() => router.push(`/dashboard/cases/${selectedCase.id}`)}>
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Abrir Caso Completo
                                        </Button>
                                    </div>
                                </div>

                                {/* Pestañas */}
                                <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                                    <div className="border-b px-4 sm:px-6 overflow-x-auto">
                                        <TabsList className="h-12 gap-2 w-full justify-start sm:w-auto">
                                            <TabsTrigger value="overview" className="gap-2">
                                                <Briefcase className="h-4 w-4" />
                                                <span className="hidden sm:inline">Resumen</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="documents" className="gap-2">
                                                <FileText className="h-4 w-4" />
                                                <span className="hidden sm:inline">Documentos</span>
                                                <span className="sm:hidden">Docs</span>
                                                <span className="hidden sm:inline">({caseDocuments.length})</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="updates" className="gap-2">
                                                <CheckSquare className="h-4 w-4" />
                                                <span className="hidden sm:inline">Actualizaciones</span>
                                                <span className="sm:hidden">Updates</span>
                                                <span className="hidden sm:inline">({caseUpdates.length})</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="communication" className="gap-2">
                                                <MessageSquare className="h-4 w-4" />
                                                <span className="hidden sm:inline">Comunicación</span>
                                                <span className="sm:hidden">Msgs</span>
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="flex-1 min-h-0">
                                        <ScrollArea className="h-full">
                                            <div className="p-4 sm:p-6">
                                                <TabsContent value="overview" className="mt-0">
                                                    <div className="space-y-6">
                                                        {/* Resumen del Caso */}
                                                        <div>
                                                            <h3 className="text-lg font-semibold mb-4">Resumen del Caso</h3>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-muted-foreground">Cliente</p>
                                                                    <p className="font-medium">{selectedCase.client.full_name}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-muted-foreground">Estado</p>
                                                                    <Badge variant={getStatusColor(selectedCase.status)}>
                                                                        {selectedCase.status}
                                                                    </Badge>
                                                                </div>
                                                                <div>
                                                                    <p className="text-muted-foreground">Fecha de Apertura</p>
                                                                    <p className="font-medium">
                                                                        {format(new Date(selectedCase.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                                                                    </p>
                                                                </div>
                                                                {selectedCase.description && (
                                                                    <div className="sm:col-span-2">
                                                                        <p className="text-muted-foreground">Descripción</p>
                                                                        <p className="font-medium">{selectedCase.description}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        {/* Timeline */}
                                                        <div>
                                                            <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                                                            {loadingDetails ? (
                                                                <div className="text-center py-8">
                                                                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                                                                </div>
                                                            ) : (
                                                                <Timeline caseItem={selectedCase} updates={caseUpdates} documents={caseDocuments} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="documents" className="mt-0">
                                                    {loadingDetails ? (
                                                        <div className="text-center py-12">
                                                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                                                            <p className="text-sm text-muted-foreground">Cargando documentos...</p>
                                                        </div>
                                                    ) : caseDocuments.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {caseDocuments.map((doc) => (
                                                                <Card key={doc.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                                                                    <CardContent className="p-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-medium truncate">{doc.file_name}</p>
                                                                                <p className="text-sm text-muted-foreground">
                                                                                    Subido {format(new Date(doc.uploaded_at), "d 'de' MMMM, yyyy", { locale: es })}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12">
                                                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                                                            <h3 className="text-lg font-semibold mb-2">Sin Documentos</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                No hay documentos asociados a este caso.
                                                            </p>
                                                        </div>
                                                    )}
                                                </TabsContent>

                                                <TabsContent value="updates" className="mt-0">
                                                    {loadingDetails ? (
                                                        <div className="text-center py-12">
                                                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                                                            <p className="text-sm text-muted-foreground">Cargando actualizaciones...</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="text-lg font-semibold">Historial de Actualizaciones</h3>
                                                                <Button onClick={() => setIsUpdateModalOpen(true)} size="sm">
                                                                    <Plus className="h-4 w-4 mr-2" />
                                                                    Nueva Actualización
                                                                </Button>
                                                            </div>

                                                            {caseUpdates.length > 0 ? (
                                                                <div className="space-y-3">
                                                                    {caseUpdates.map((update) => (
                                                                        <Card key={update.id} className="hover:bg-accent/50 transition-colors">
                                                                            <CardContent className="p-4">
                                                                                <div className="flex items-start gap-3">
                                                                                    <div className={`rounded-full p-2 mt-1 ${update.status === 'Pendiente' ? 'bg-yellow-500/10 text-yellow-500' :
                                                                                        update.status === 'En Proceso' ? 'bg-blue-500/10 text-blue-500' :
                                                                                            update.status === 'Completado' ? 'bg-green-500/10 text-green-500' :
                                                                                                'bg-gray-500/10 text-gray-500'
                                                                                        }`}>
                                                                                        <CheckSquare className="h-4 w-4" />
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                                                            <p className="font-medium">{update.update_text}</p>
                                                                                            <Badge variant={
                                                                                                update.status === 'Pendiente' ? 'secondary' :
                                                                                                    update.status === 'En Proceso' ? 'default' :
                                                                                                        update.status === 'Completado' ? 'outline' :
                                                                                                            'outline'
                                                                                            }>
                                                                                                {update.status}
                                                                                            </Badge>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                                            <div className="flex items-center gap-1">
                                                                                                <UserIcon className="h-3 w-3" />
                                                                                                <span>{update.created_by.full_name}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-1">
                                                                                                <Clock className="h-3 w-3" />
                                                                                                <span>{format(new Date(update.created_at), "d 'de' MMM, yyyy", { locale: es })}</span>
                                                                                            </div>
                                                                                            {update.visible_to_client && (
                                                                                                <Badge variant="outline" className="text-xs">Visible al cliente</Badge>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </CardContent>
                                                                        </Card>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-12 border rounded-lg border-dashed">
                                                                    <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                                                                    <h3 className="text-lg font-semibold mb-2">Sin Actualizaciones</h3>
                                                                    <p className="text-sm text-muted-foreground mb-4">
                                                                        No hay actualizaciones registradas para este caso.
                                                                    </p>
                                                                    <Button variant="outline" onClick={() => setIsUpdateModalOpen(true)}>
                                                                        Crear Primera Actualización
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </TabsContent>

                                                <TabsContent value="communication" className="mt-0">
                                                    <div className="text-center py-12">
                                                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                                                        <h3 className="text-lg font-semibold mb-2">Comunicaciones</h3>
                                                        <p className="text-sm text-muted-foreground mb-4">
                                                            Aquí se mostrará el historial de comunicaciones del caso.
                                                        </p>
                                                        <Button variant="outline" disabled>
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Próximamente
                                                        </Button>
                                                    </div>
                                                </TabsContent>
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </Tabs>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                                <Briefcase className="h-16 w-16 mb-4 opacity-20" />
                                <p>Selecciona un caso para ver sus detalles</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Modal para Crear/Editar Caso */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingCase ? 'Editar Caso' : 'Nuevo Caso'}</DialogTitle>
                        </DialogHeader>
                        <CaseForm caseItem={editingCase} clients={clients} onSave={handleSaveCase} onFinish={() => setIsModalOpen(false)} />
                    </DialogContent>
                </Dialog>

                {/* Modal para Crear Actualización */}
                <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Nueva Actualización</DialogTitle>
                        </DialogHeader>
                        {selectedCase && (
                            <UpdateForm
                                caseId={selectedCase.id}
                                onSave={handleCreateUpdate}
                                onFinish={() => setIsUpdateModalOpen(false)}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}
