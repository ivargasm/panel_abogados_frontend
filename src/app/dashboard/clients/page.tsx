// app/dashboard/clients/page.tsx
// Versión final de la Fase 1: Gestión completa de Clientes con
// funcionalidades de Crear, Leer, Actualizar y Eliminar (CRUD).

"use client";

import React, { useState, useEffect } from 'react';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Importaciones de componentes de shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Importaciones de tu lógica de negocio
import { useAuthStore } from '@/app/store/Store';
import { getClients, createClient, updateClient, deleteClient } from '@/app/lib/api';
import ProtectedRoute from '@/app/components/ProtectedRoutes';

// Definimos el tipo para un cliente
type Client = {
    id: number;
    full_name: string;
    email: string | null;
    phone_number: string | null;
    address: string | null;
    rfc: string | null;
    can_view_billing: boolean;
};

// --- Componente del Formulario (Ahora maneja Crear y Editar) ---
function ClientForm({ client, onSave, onFinish }: { client: Partial<Client> | null, onSave: (clientData: Omit<Client, 'id'>) => Promise<void>, onFinish: () => void }) {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        address: '',
        rfc: '',
        can_view_billing: false
    });

    useEffect(() => {
        // Si pasamos un cliente (modo edición), llenamos el formulario
        if (client) {
            setFormData({
                full_name: client.full_name || '',
                email: client.email || '',
                phone_number: client.phone_number || '',
                address: client.address || '',
                rfc: client.rfc || '',
                can_view_billing: client.can_view_billing || false
            });
        } else {
            // Si no (modo creación), el formulario está vacío
            setFormData({ full_name: '', email: '', phone_number: '', address: '', rfc: '', can_view_billing: false });
        }
    }, [client]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            {/* ... campos del formulario ... */}
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="full_name" className="text-right">Nombre</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone_number" className="text-right">Teléfono</Label>
                <Input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">Dirección</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rfc" className="text-right">RFC</Label>
                <Input id="rfc" name="rfc" value={formData.rfc} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="can_view_billing" className="text-right">Ver Facturación</Label>
                <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                        id="can_view_billing"
                        checked={formData.can_view_billing}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_view_billing: checked }))}
                    />
                    <Label htmlFor="can_view_billing" className="text-sm text-muted-foreground cursor-pointer">
                        Permitir que el cliente vea su facturación en el portal
                    </Label>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onFinish}>Cancelar</Button>
                <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
        </form>
    );
}

// --- Componente Principal de la Página ---
export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { url } = useAuthStore();


    useEffect(() => {
        const fetchClients = async () => {
            try {
                setLoading(true);
                const data = await getClients(url);
                setClients(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, [url]);

    const handleSaveClient = async (clientData: Omit<Client, 'id'>) => {
        try {
            if (editingClient) {
                // Modo Edición
                const updated = await updateClient(editingClient.id, clientData, url);
                setClients(prev => prev.map(c => c.id === editingClient.id ? updated : c));
                toast.success('Cliente actualizado correctamente');
            } else {
                // Modo Creación
                const created = await createClient(clientData, url);
                setClients(prev => [...prev, created]);
                toast.success('Cliente creado correctamente');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'No se pudo guardar el cliente');
        }
    };

    const handleDeleteClient = async (clientId: number) => {
        try {
            await deleteClient(clientId, url);
            setClients(prev => prev.filter(c => c.id !== clientId));
            toast.success("Cliente eliminado correctamente.");
        } catch (err) {
            if (err instanceof Error && err.message.includes('409')) {
                toast.error('No se puede eliminar: El cliente tiene casos asociados.');
            } else {
                toast.error(err instanceof Error ? err.message : 'No se pudo eliminar el cliente');
            }
        }
    };

    const openCreateModal = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const openEditModal = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    return (
        <ProtectedRoute allowedRoles={['owner', 'lawyer']}>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Clientes</h1>
                <Button className='cursor-pointer' onClick={openCreateModal}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Cliente
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Clientes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre Completo</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && <TableRow><TableCell colSpan={4} className="text-center h-24">Cargando...</TableCell></TableRow>}
                            {error && <TableRow><TableCell colSpan={4} className="text-center h-24 text-destructive">{error}</TableCell></TableRow>}
                            {!loading && clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-medium">{client.full_name}</TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>{client.phone_number}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openEditModal(client)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Editar</span>
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" className="w-full justify-start text-sm p-2 font-normal text-destructive hover:bg-destructive/10">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Eliminar</span>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente y todos sus datos asociados.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteClient(client.id)} className="bg-destructive hover:bg-destructive/90">
                                                                Sí, eliminar cliente
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Modal para Crear y Editar */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</DialogTitle>
                        <DialogDescription>
                            {editingClient ? 'Modifica los datos del cliente.' : 'Completa los datos para registrar un nuevo cliente.'}
                        </DialogDescription>
                    </DialogHeader>
                    <ClientForm client={editingClient} onSave={handleSaveClient} onFinish={() => setIsModalOpen(false)} />
                </DialogContent>
            </Dialog>
        </ProtectedRoute>
    );
}
