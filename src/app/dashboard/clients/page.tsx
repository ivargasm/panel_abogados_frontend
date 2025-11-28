// app/dashboard/clients/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Mail, Phone, MapPin, Calendar, Clock, MoreVertical, Edit, Trash2, User as UserIcon, FileText, DollarSign, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importaciones de componentes de shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Importaciones de tu lógica de negocio
import { useAuthStore } from '@/app/store/Store';
import { getClients, createClient, updateClient, deleteClient, getCases, getInvoices } from '@/app/lib/api';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import type { Case, Document, Invoice } from '@/app/types';
import { InvitationButton } from '@/components/clients/InvitationButton';

// Definimos el tipo para un cliente
type Client = {
    id: number;
    full_name: string;
    email: string | null;
    phone_number: string | null;
    address: string | null;
    rfc: string | null;
    notes: string | null;
    can_view_billing: boolean;
    created_at?: string;
    updated_at?: string;
};

// --- Componente del Formulario (Ahora maneja Crear y Editar) ---
function ClientForm({ client, onSave, onFinish }: { client: Partial<Client> | null, onSave: (clientData: Omit<Client, 'id'>) => Promise<void>, onFinish: () => void }) {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        address: '',
        rfc: '',
        notes: '',
        can_view_billing: false
    });

    useEffect(() => {
        if (client) {
            setFormData({
                full_name: client.full_name || '',
                email: client.email || '',
                phone_number: client.phone_number || '',
                address: client.address || '',
                rfc: client.rfc || '',
                notes: client.notes || '',
                can_view_billing: client.can_view_billing || false
            });
        } else {
            setFormData({ full_name: '', email: '', phone_number: '', address: '', rfc: '', notes: '', can_view_billing: false });
        }
    }, [client]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await onSave(formData);
        onFinish();
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone_number">Teléfono</Label>
                    <Input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="rfc">RFC</Label>
                <Input id="rfc" name="rfc" value={formData.rfc} onChange={handleInputChange} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="notes">Notas del Cliente</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Información adicional relevante..."
                    className="min-h-[100px]"
                />
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Switch
                    id="can_view_billing"
                    checked={formData.can_view_billing}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_view_billing: checked }))}
                />
                <Label htmlFor="can_view_billing" className="text-sm font-normal cursor-pointer">
                    Permitir acceso al portal de facturación
                </Label>
            </div>

            <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={onFinish}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
            </DialogFooter>
        </form>
    );
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para las pestañas
    const [clientCases, setClientCases] = useState<Case[]>([]);
    const [clientDocuments, setClientDocuments] = useState<Document[]>([]);
    const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
    const [loadingCases, setLoadingCases] = useState(false);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    const { url } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                setLoading(true);
                const data = await getClients(url);
                setClients(data);
                if (data.length > 0 && !selectedClient) {
                    setSelectedClient(data[0]);
                }
            } catch (err) {
                toast.error('Error al cargar clientes');
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, [url]);

    // Cargar datos del cliente seleccionado
    useEffect(() => {
        if (!selectedClient) return;

        const fetchClientData = async () => {
            // Cargar casos
            setLoadingCases(true);
            try {
                const cases = await getCases(url, selectedClient.id);
                setClientCases(cases);

                // Cargar documentos de todos los casos del cliente
                setLoadingDocuments(true);
                try {
                    const allDocuments: Document[] = [];
                    for (const caso of cases) {
                        const { getDocumentsForCase } = await import('@/app/lib/api');
                        const docs = await getDocumentsForCase(caso.id, url);
                        allDocuments.push(...docs);
                    }
                    setClientDocuments(allDocuments);
                } catch (err) {
                    console.error('Error al cargar documentos:', err);
                    setClientDocuments([]);
                } finally {
                    setLoadingDocuments(false);
                }
            } catch (err) {
                console.error('Error al cargar casos:', err);
                setClientCases([]);
                setClientDocuments([]);
            } finally {
                setLoadingCases(false);
            }

            // Cargar facturas
            setLoadingInvoices(true);
            try {
                const invoices = await getInvoices(url);
                // Filtrar facturas del cliente seleccionado
                const clientInvoices = invoices.filter((inv: Invoice) => inv.client_id === selectedClient.id);
                setClientInvoices(clientInvoices);
            } catch (err) {
                console.error('Error al cargar facturas:', err);
                setClientInvoices([]);
            } finally {
                setLoadingInvoices(false);
            }
        };

        fetchClientData();
    }, [selectedClient, url]);

    const handleSaveClient = async (clientData: Omit<Client, 'id'>) => {
        try {
            if (editingClient) {
                const updated = await updateClient(editingClient.id, clientData, url);
                setClients(prev => prev.map(c => c.id === editingClient.id ? updated : c));
                setSelectedClient(updated);
                toast.success('Cliente actualizado');
            } else {
                const created = await createClient(clientData, url);
                setClients(prev => [...prev, created]);
                setSelectedClient(created);
                toast.success('Cliente creado');
            }
        } catch (err) {
            toast.error('Error al guardar cliente');
        }
    };

    const handleDeleteClient = async (clientId: number) => {
        try {
            await deleteClient(clientId, url);
            const newClients = clients.filter(c => c.id !== clientId);
            setClients(newClients);
            if (selectedClient?.id === clientId) {
                setSelectedClient(newClients[0] || null);
            }
            toast.success("Cliente eliminado");
        } catch (err) {
            toast.error('No se pudo eliminar el cliente');
        }
    };

    const filteredClients = clients.filter(client =>
        client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['owner', 'lawyer']}>
            <div className="flex flex-col gap-4 h-full lg:h-[calc(100vh-2rem)]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
                        <p className="text-muted-foreground">Gestiona y revisa toda la información de tus clientes.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
                    {/* Lista de Clientes (Izquierda) */}
                    <Card className={`lg:col-span-4 flex flex-col h-[500px] lg:h-full min-h-0 border-r-0 lg:border-r ${selectedClient ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="p-4 border-b space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar clientes..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button onClick={() => { setEditingClient(null); setIsModalOpen(true); }} className="shrink-0">
                                    <Plus className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Nuevo</span>
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ScrollArea className="h-full">
                                <div className="divide-y">
                                    {filteredClients.map((client) => (
                                        <div
                                            key={client.id}
                                            className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${selectedClient?.id === client.id ? 'bg-accent' : ''}`}
                                            onClick={() => setSelectedClient(client)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{client.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{client.full_name}</p>
                                                    <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                                                </div>
                                                <div className="lg:hidden">
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                {selectedClient?.id === client.id && (
                                                    <div className="hidden lg:block w-1 h-8 bg-primary rounded-full" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {filteredClients.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground">
                                            No se encontraron clientes
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </Card>

                    {/* Detalle del Cliente (Derecha) */}
                    <Card className={`lg:col-span-8 flex flex-col h-full min-h-0 border-l-0 lg:border-l ${selectedClient ? 'flex' : 'hidden lg:flex'}`}>
                        {selectedClient ? (
                            <div className="flex flex-col h-full">
                                {/* Header del Detalle */}
                                <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex gap-4 w-full sm:w-auto">
                                        <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setSelectedClient(null)}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                                            <AvatarFallback className="text-lg sm:text-xl">{selectedClient.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-xl sm:text-2xl font-bold truncate">{selectedClient.full_name}</h2>
                                            <p className="text-sm sm:text-base text-muted-foreground truncate">{selectedClient.email}</p>
                                            <div className="flex gap-2 mt-2">
                                                <InvitationButton
                                                    clientId={selectedClient.id}
                                                    clientEmail={selectedClient.email || undefined}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                                        <Button variant="outline" size="sm" onClick={() => { setEditingClient(selectedClient); setIsModalOpen(true); }}>
                                            <Edit className="h-4 w-4 mr-2" /> Editar
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" className="h-9 w-9">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción eliminará permanentemente al cliente y todos sus datos.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteClient(selectedClient.id)}>Eliminar</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                {/* Tabs de Información */}
                                <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0">
                                    <div className="border-b px-4 sm:px-6 overflow-x-auto">
                                        <TabsList className="h-12 gap-2 w-full justify-start sm:w-auto">
                                            <TabsTrigger value="info" className="gap-2">
                                                <UserIcon className="h-4 w-4" />
                                                <span className="hidden sm:inline">Información</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="cases" className="gap-2">
                                                <Briefcase className="h-4 w-4" />
                                                <span className="hidden sm:inline">Casos</span>
                                                <span className="sm:hidden">({clientCases.length})</span>
                                                <span className="hidden sm:inline">({clientCases.length})</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="documents" className="gap-2">
                                                <FileText className="h-4 w-4" />
                                                <span className="hidden sm:inline">Docs</span>
                                                <span className="sm:hidden">({clientDocuments.length})</span>
                                                <span className="hidden sm:inline">({clientDocuments.length})</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="billing" className="gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                <span className="hidden sm:inline">Facturación</span>
                                                <span className="sm:hidden">({clientInvoices.length})</span>
                                                <span className="hidden sm:inline">({clientInvoices.length})</span>
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="flex-1 min-h-0">
                                        <ScrollArea className="h-full">
                                            <div className="p-4 sm:p-6">
                                                <TabsContent value="info" className="mt-0">
                                                    <div className="grid gap-8">
                                                        {/* Contact Details */}
                                                        <div>
                                                            <h3 className="text-lg font-semibold mb-4">Detalles de Contacto</h3>
                                                            <div className="grid gap-4 text-sm">
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                    <div className="flex items-center gap-2 text-muted-foreground w-24">
                                                                        <Mail className="h-4 w-4" />
                                                                        <span>Email:</span>
                                                                    </div>
                                                                    <span className="break-all">{selectedClient.email || 'No registrado'}</span>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                    <div className="flex items-center gap-2 text-muted-foreground w-24">
                                                                        <Phone className="h-4 w-4" />
                                                                        <span>Teléfono:</span>
                                                                    </div>
                                                                    <span>{selectedClient.phone_number || 'No registrado'}</span>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                    <div className="flex items-center gap-2 text-muted-foreground w-24">
                                                                        <MapPin className="h-4 w-4" />
                                                                        <span>Dirección:</span>
                                                                    </div>
                                                                    <span>{selectedClient.address || 'No registrada'}</span>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                    <div className="flex items-center gap-2 text-muted-foreground w-24">
                                                                        <UserIcon className="h-4 w-4" />
                                                                        <span>RFC:</span>
                                                                    </div>
                                                                    <span>{selectedClient.rfc || 'No registrado'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        {/* Client Notes */}
                                                        <div>
                                                            <h3 className="text-lg font-semibold mb-4">Notas del Cliente</h3>
                                                            <Card className="bg-muted/50 border-none">
                                                                <CardContent className="p-4">
                                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                                        {selectedClient.notes || 'No hay notas registradas para este cliente.'}
                                                                    </p>
                                                                </CardContent>
                                                            </Card>
                                                        </div>

                                                        <Separator />

                                                        {/* Key Dates */}
                                                        <div>
                                                            <h3 className="text-lg font-semibold mb-4">Fechas Clave</h3>
                                                            <div className="grid gap-4 text-sm">
                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                                        <Calendar className="h-4 w-4" />
                                                                        <span>Cliente desde</span>
                                                                    </div>
                                                                    <span className="font-medium">
                                                                        {selectedClient.created_at
                                                                            ? format(new Date(selectedClient.created_at), "d 'de' MMMM, yyyy", { locale: es })
                                                                            : 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                                        <Clock className="h-4 w-4" />
                                                                        <span>Última actualización</span>
                                                                    </div>
                                                                    <span className="font-medium">
                                                                        {selectedClient.updated_at
                                                                            ? format(new Date(selectedClient.updated_at), "d 'de' MMMM, yyyy", { locale: es })
                                                                            : 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="cases" className="mt-0">
                                                    {loadingCases ? (
                                                        <div className="text-center py-12">
                                                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                                                            <p className="text-sm text-muted-foreground">Cargando casos...</p>
                                                        </div>
                                                    ) : clientCases.length > 0 ? (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h3 className="text-lg font-semibold">Casos del Cliente</h3>
                                                                <Badge variant="secondary">{clientCases.length} caso{clientCases.length !== 1 ? 's' : ''}</Badge>
                                                            </div>
                                                            <div className="grid gap-4">
                                                                {clientCases.map((caso) => (
                                                                    <Card key={caso.id} onClick={() => router.push(`/dashboard/cases/${caso.id}`)} className="hover:bg-accent/50 transition-colors cursor-pointer">
                                                                        <CardHeader>
                                                                            <div className="flex items-start justify-between">
                                                                                <div className="flex-1">
                                                                                    <CardTitle className="text-base">{caso.title}</CardTitle>
                                                                                    {caso.case_number && (
                                                                                        <CardDescription className="mt-1">
                                                                                            Caso #{caso.case_number}
                                                                                        </CardDescription>
                                                                                    )}
                                                                                </div>
                                                                                <Badge variant={
                                                                                    caso.status === 'Activo' ? 'default' :
                                                                                        caso.status === 'Cerrado' ? 'secondary' :
                                                                                            'outline'
                                                                                }>
                                                                                    {caso.status}
                                                                                </Badge>
                                                                            </div>
                                                                        </CardHeader>
                                                                        {caso.description && (
                                                                            <CardContent>
                                                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                                                    {caso.description}
                                                                                </p>
                                                                            </CardContent>
                                                                        )}
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12">
                                                            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                                                            <h3 className="text-lg font-semibold mb-2">Sin Casos</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                Este cliente no tiene casos asociados todavía.
                                                            </p>
                                                        </div>
                                                    )}
                                                </TabsContent>

                                                <TabsContent value="documents" className="mt-0">
                                                    {loadingDocuments ? (
                                                        <div className="text-center py-12">
                                                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                                                            <p className="text-sm text-muted-foreground">Cargando documentos...</p>
                                                        </div>
                                                    ) : clientDocuments.length > 0 ? (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h3 className="text-lg font-semibold">Documentos del Cliente</h3>
                                                                <Badge variant="secondary">{clientDocuments.length} documento{clientDocuments.length !== 1 ? 's' : ''}</Badge>
                                                            </div>
                                                            <div className="grid gap-3">
                                                                {clientDocuments.map((doc) => (
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
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12">
                                                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                                                            <h3 className="text-lg font-semibold mb-2">Sin Documentos</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                No hay documentos asociados a este cliente.
                                                            </p>
                                                        </div>
                                                    )}
                                                </TabsContent>

                                                <TabsContent value="billing" className="mt-0">
                                                    {loadingInvoices ? (
                                                        <div className="text-center py-12">
                                                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                                                            <p className="text-sm text-muted-foreground">Cargando facturas...</p>
                                                        </div>
                                                    ) : clientInvoices.length > 0 ? (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h3 className="text-lg font-semibold">Facturación del Cliente</h3>
                                                                <Badge variant="secondary">{clientInvoices.length} factura{clientInvoices.length !== 1 ? 's' : ''}</Badge>
                                                            </div>
                                                            <div className="grid gap-4">
                                                                {clientInvoices.map((invoice) => (
                                                                    <Card key={invoice.id} onClick={() => router.push(`/dashboard/billing/${invoice.id}`)} className="hover:bg-accent/50 transition-colors cursor-pointer">
                                                                        <CardHeader>
                                                                            <div className="flex items-start justify-between">
                                                                                <div className="flex-1">
                                                                                    <CardTitle className="text-base">Factura #{invoice.invoice_number}</CardTitle>
                                                                                    <CardDescription className="mt-1">
                                                                                        Emitida: {format(new Date(invoice.issue_date), "d 'de' MMMM, yyyy", { locale: es })}
                                                                                    </CardDescription>
                                                                                </div>
                                                                                <Badge variant={
                                                                                    invoice.status === 'Pagada' ? 'default' :
                                                                                        invoice.status === 'Pendiente' ? 'secondary' :
                                                                                            invoice.status === 'Vencida' ? 'destructive' :
                                                                                                'outline'
                                                                                }>
                                                                                    {invoice.status}
                                                                                </Badge>
                                                                            </div>
                                                                        </CardHeader>
                                                                        <CardContent>
                                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                                <div>
                                                                                    <p className="text-muted-foreground">Monto Total</p>
                                                                                    <p className="font-semibold text-lg">${invoice.amount.toFixed(2)}</p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-muted-foreground">Saldo Pendiente</p>
                                                                                    <p className="font-semibold text-lg">${invoice.balance_due.toFixed(2)}</p>
                                                                                </div>
                                                                                <div className="col-span-2">
                                                                                    <p className="text-muted-foreground">Vencimiento</p>
                                                                                    <p className="font-medium">
                                                                                        {format(new Date(invoice.due_date), "d 'de' MMMM, yyyy", { locale: es })}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12">
                                                            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                                                            <h3 className="text-lg font-semibold mb-2">Sin Facturas</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                No hay facturas registradas para este cliente.
                                                            </p>
                                                        </div>
                                                    )}
                                                </TabsContent>
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </Tabs>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                                <UserIcon className="h-16 w-16 mb-4 opacity-20" />
                                <p>Selecciona un cliente para ver sus detalles</p>
                            </div>
                        )}
                    </Card>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
                            <DialogDescription>
                                {editingClient ? 'Actualiza la información del cliente.' : 'Ingresa los datos del nuevo cliente.'}
                            </DialogDescription>
                        </DialogHeader>
                        <ClientForm client={editingClient} onSave={handleSaveClient} onFinish={() => setIsModalOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}
