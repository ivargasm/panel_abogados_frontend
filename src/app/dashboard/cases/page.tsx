// app/dashboard/cases/page.tsx
// Página para la gestión de Casos/Expedientes.

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, MoreHorizontal, Edit, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Importaciones de componentes de shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge"; // Usaremos Badges para el estado del caso

// Importaciones de tu lógica de negocio
import { useAuthStore } from '@/app/store/Store';
import { getCases, createCase, getClients, updateCase, deleteCase } from '@/app/lib/api'; // Necesitamos getClients para el formulario
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import { CaseData } from '@/app/types';


// Definimos los tipos de datos que vienen de la API
type Client = {
    id: number;
    full_name: string;
};

type Case = {
    id: number;
    title: string;
    case_number: string | null;
    status: string;
    client: Client; // El cliente viene anidado gracias a la mejora en el backend
};

// --- Componente del Formulario para Crear un Caso ---
function CaseForm({ caseItem, clients, onSave, onFinish }: { caseItem: Partial<Case> | null, clients: Client[], onSave: (caseData: CaseData) => Promise<void>, onFinish: () => void }) {
    const [caseData, setCaseData] = useState({
        title: '',
        case_number: '',
        description: '',
        client_id: '' // Guardaremos el ID del cliente seleccionado
    });

    useEffect(() => {
        if (caseItem) {
            setCaseData({
                title: caseItem.title || '',
                case_number: caseItem.case_number || '',
                description: (caseItem as unknown as { description: string }).description || '', // Asumimos que puede existir
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

    const handleClientChange = (clientId: string) => {
        setCaseData(prev => ({ ...prev, client_id: clientId }));
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
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Título del Caso</Label>
                <Input id="title" name="title" value={caseData.title} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="case_number" className="text-right">No. Expediente</Label>
                <Input id="case_number" name="case_number" value={caseData.case_number} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client_id" className="text-right">Cliente</Label>
                <Select onValueChange={handleClientChange} value={caseData.client_id}>
                    <SelectTrigger className="col-span-3">
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
            <DialogFooter>
                <Button type="submit" className='cursor-pointer'>Guardar Caso</Button>
            </DialogFooter>
        </form>
    );
}

// --- Componente Principal de la Página de Casos ---
export default function CasesPage() {
    const [cases, setCases] = useState<Case[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [editingCase, setEditingCase] = useState<Case | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredClientId, setFilteredClientId] = useState<string | null>(null);
    const { url } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Hacemos dos llamadas en paralelo para cargar casos y clientes
                const [casesData, clientsData] = await Promise.all([
                    getCases(url, filteredClientId ? Number(filteredClientId) : null),
                    getClients(url)
                ]);
                setCases(casesData);
                setClients(clientsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [url, filteredClientId]);

    const handleSaveCase = async (caseData: CaseData) => {
        try {
            let updatedCases;
            if (editingCase) {
                const updated = await updateCase(editingCase.id, caseData, url);
                updatedCases = cases.map(c => c.id === editingCase.id ? updated : c);
            } else {
                const created = await createCase(caseData, url);
                updatedCases = [...cases, created];
            }
            setCases(updatedCases);

            // Para asegurar que los datos del cliente se muestren correctamente, recargamos la lista.
            const refreshedCases = await getCases(url, filteredClientId ? Number(filteredClientId) : null);
            // Para ver el nombre del cliente inmediatamente, volvemos a cargar los casos
            setCases(refreshedCases);
            toast.success('Caso creado con éxito');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'No se pudo crear el caso');
        }
    };

    const handleDeleteCase = async (caseId: number) => {
        try {
            await deleteCase(caseId, url);
            setCases(prev => prev.filter(c => c.id !== caseId));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'No se pudo eliminar el caso');
        }
    };

    // --- Función para manejar el clic en la fila ---
    const handleRowClick = (caseId: number) => {
        router.push(`/dashboard/cases/${caseId}`);
    };

    const openCreateModal = () => {
        setEditingCase(null);
        setIsModalOpen(true);
    };

    const openEditModal = (caseItem: Case) => {
        setEditingCase(caseItem);
        setIsModalOpen(true);
    };

    const selectedClientName = useMemo(() => {
        if (!filteredClientId) return "Todos los Casos";
        return clients.find(c => c.id === Number(filteredClientId))?.full_name || "Casos Filtrados";
    }, [filteredClientId, clients]);

    return (
        <ProtectedRoute>
            <div className="flex items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Casos / Expedientes</h1>
                    <p className="text-muted-foreground">Mostrando: <span className="font-semibold text-primary">{selectedClientName}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={filteredClientId || ''} onValueChange={setFilteredClientId}>
                        <SelectTrigger className="w-[200px] bg-background cursor-pointer">
                            <SelectValue placeholder="Filtrar por cliente..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Clientes</SelectLabel>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={String(client.id)}>{client.full_name}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {filteredClientId && (
                        <Button variant="ghost" size="icon" onClick={() => setFilteredClientId(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    <Button onClick={() => openCreateModal()} className="flex items-center gap-2 cursor-pointer">
                        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Caso
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Casos</CardTitle>
                    <CardDescription>Gestiona todos los casos de tu despacho.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título del Caso</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>No. Expediente</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && <TableRow><TableCell colSpan={5} className="text-center h-24">Cargando...</TableCell></TableRow>}
                            {error && <TableRow><TableCell colSpan={5} className="text-center h-24 text-destructive">{error}</TableCell></TableRow>}
                            {!loading && cases.map((caseItem) => (
                                <TableRow key={caseItem.id} onClick={() => handleRowClick(caseItem.id)} className="cursor-pointer">
                                    <TableCell className="font-medium">{caseItem.title}</TableCell>
                                    <TableCell>{caseItem.client.full_name}</TableCell>
                                    <TableCell>{caseItem.case_number || 'N/A'}</TableCell>
                                    <TableCell><Badge variant="outline">{caseItem.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(caseItem); }}>
                                                    <Edit className="mr-2 h-4 w-4" /><span>Editar</span>
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" className="w-full justify-start text-sm p-2 font-normal text-destructive hover:bg-destructive/10">
                                                            <Trash2 className="mr-2 h-4 w-4" /><span>Eliminar</span>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                            <AlertDialogDescription>Esta acción marcará el caso como inactivo, pero no se eliminará permanentemente.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteCase(caseItem.id)} className="bg-destructive hover:bg-destructive/90">Sí, eliminar</AlertDialogAction>
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

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingCase ? 'Editar Caso' : 'Añadir Nuevo Caso'}</DialogTitle>
                    </DialogHeader>
                    <CaseForm caseItem={editingCase} clients={clients} onSave={handleSaveCase} onFinish={() => setIsModalOpen(false)} />
                </DialogContent>
            </Dialog>
        </ProtectedRoute>
    );
}
