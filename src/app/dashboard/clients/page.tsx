// app/dashboard/clients/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    Edit,
    Trash2,
    User as UserIcon,
    FileText,
    DollarSign,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Download,
    AlertTriangle,
    Eye,
    Building2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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

import {
    API_URL,
    getClients,
    createClient,
    updateClient,
    deleteClient,
    getCases,
    getInvoices,
    getDocumentsForCase,
    getDownloadUrl,
    checkConflictOfInterest,
} from "@/app/lib/api";
import type { Case, Document, Invoice, ConflictCheckResult } from "@/app/types";
import { InvitationButton } from "@/components/clients/InvitationButton";
import {
    formatCurrencyMXN,
    getCaseStatusLabel,
    getCaseStatusStyle,
    INVOICE_STATUS_LABELS,
} from "@/lib/legal-domain";

type ClientRecord = {
    id: number;
    client_type?: "FISICA" | "MORAL";
    full_name: string;
    business_name?: string | null;
    trade_name?: string | null;
    representative_name?: string | null;
    email: string | null;
    phone_number: string | null;
    address: string | null;
    rfc: string | null;
    notes: string | null;
    can_view_billing: boolean;
    created_at?: string;
    updated_at?: string;
};

function ClientForm({
    client,
    onSave,
    onFinish,
}: {
    client: Partial<ClientRecord> | null;
    onSave: (clientData: Omit<ClientRecord, "id">) => Promise<void>;
    onFinish: () => void;
}) {
    const [formData, setFormData] = useState<{
        client_type: "FISICA" | "MORAL";
        full_name: string;
        business_name: string;
        trade_name: string;
        representative_name: string;
        email: string;
        phone_number: string;
        address: string;
        rfc: string;
        notes: string;
        can_view_billing: boolean;
    }>({
        client_type: "FISICA",
        full_name: "",
        business_name: "",
        trade_name: "",
        representative_name: "",
        email: "",
        phone_number: "",
        address: "",
        rfc: "",
        notes: "",
        can_view_billing: true,
    });
    const [conflictResult, setConflictResult] = useState<ConflictCheckResult | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (client) {
            setFormData({
                client_type: client.client_type === "MORAL" ? "MORAL" : "FISICA",
                full_name: client.full_name || "",
                business_name: client.business_name || "",
                trade_name: client.trade_name || "",
                representative_name: client.representative_name || "",
                email: client.email || "",
                phone_number: client.phone_number || "",
                address: client.address || "",
                rfc: client.rfc || "",
                notes: client.notes || "",
                can_view_billing: client.can_view_billing ?? true,
            });
        } else {
            setFormData({
                client_type: "FISICA",
                full_name: "",
                business_name: "",
                trade_name: "",
                representative_name: "",
                email: "",
                phone_number: "",
                address: "",
                rfc: "",
                notes: "",
                can_view_billing: true,
            });
        }
    }, [client]);

    useEffect(() => {
        const queryTerm =
            formData.client_type === "MORAL"
                ? (formData.business_name.trim() || formData.representative_name.trim() || formData.full_name.trim())
                : formData.full_name.trim();

        const queryRfc = formData.rfc.trim().toUpperCase();

        if (queryTerm.length < 3 && queryRfc.length < 4) {
            setConflictResult(null);
            return;
        }

        const timer = setTimeout(async () => {
            const res = await checkConflictOfInterest(
                queryTerm || queryRfc,
                { rfc: queryRfc || undefined, excludeClientId: client?.id },
                API_URL
            );
            setConflictResult(res);
        }, 350);
        return () => clearTimeout(timer);
    }, [formData.full_name, formData.business_name, formData.representative_name, formData.rfc, formData.client_type, client?.id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        try {
            const resolvedFullName =
                formData.client_type === "MORAL"
                    ? (formData.representative_name.trim() || formData.business_name.trim())
                    : formData.full_name.trim();

            await onSave({
                ...formData,
                full_name: resolvedFullName,
                business_name: formData.client_type === "MORAL" ? formData.business_name.trim() || null : null,
                trade_name: formData.client_type === "MORAL" ? formData.trade_name.trim() || null : null,
                representative_name: formData.client_type === "MORAL" ? formData.representative_name.trim() || null : null,
                email: formData.email.trim() || null,
                phone_number: formData.phone_number.trim() || null,
                address: formData.address.trim() || null,
                rfc: formData.rfc.trim().toUpperCase() || null,
                notes: formData.notes.trim() || null,
            });
            onFinish();
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
            {/* Selector de Personalidad Jurídica */}
            <div className="grid gap-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Personalidad Jurídica (Derecho Civil y Mercantil Mexicano) *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, client_type: "FISICA" }))}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                            formData.client_type === "FISICA"
                                ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                                : "border-border hover:bg-muted/50 text-muted-foreground"
                        }`}
                    >
                        <UserIcon className="h-5 w-5 shrink-0" />
                        <div>
                            <div className="text-sm font-medium leading-none text-foreground">Persona Física</div>
                            <div className="text-xs text-muted-foreground mt-0.5">Sujeto individual (Nombre y Apellidos)</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, client_type: "MORAL" }))}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                            formData.client_type === "MORAL"
                                ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                                : "border-border hover:bg-muted/50 text-muted-foreground"
                        }`}
                    >
                        <Building2 className="h-5 w-5 shrink-0" />
                        <div>
                            <div className="text-sm font-medium leading-none text-foreground">Persona Moral</div>
                            <div className="text-xs text-muted-foreground mt-0.5">Sociedad / Empresa (Razón Social)</div>
                        </div>
                    </button>
                </div>
            </div>

            {formData.client_type === "FISICA" ? (
                <div className="grid gap-2">
                    <Label htmlFor="full_name">Nombre Completo del Cliente *</Label>
                    <Input
                        id="full_name"
                        name="full_name"
                        placeholder="Ej: Dra. María Elena Hernández Soto"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            ) : (
                <div className="grid gap-3 p-3 rounded-lg bg-muted/40 border border-border/80">
                    <div className="grid gap-2">
                        <Label htmlFor="business_name">Razón o Denominación Social Oficial *</Label>
                        <Input
                            id="business_name"
                            name="business_name"
                            placeholder="Ej: Constructora Horizonte Metropolitano, S.A. de C.V."
                            value={formData.business_name}
                            onChange={handleInputChange}
                            required
                        />
                        <span className="text-[11px] text-muted-foreground">
                            Denominación conforme al Acta Constitutiva o Cédula de Identificación Fiscal SAT.
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="representative_name">Representante Legal / Apoderado *</Label>
                            <Input
                                id="representative_name"
                                name="representative_name"
                                placeholder="Ej: Lic. Roberto González Méndez"
                                value={formData.representative_name}
                                onChange={handleInputChange}
                                required
                            />
                            <span className="text-[11px] text-muted-foreground">
                                Apoderado con facultades para pleitos y cobranzas.
                            </span>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="trade_name">Nombre Comercial / Marca (Opcional)</Label>
                            <Input
                                id="trade_name"
                                name="trade_name"
                                placeholder="Ej: Horizonte Homes"
                                value={formData.trade_name}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Alerta Deontológica de Conflicto de Interés */}
            {conflictResult && conflictResult.has_conflict && (
                <div className="rounded-md border border-amber-400 bg-amber-500/10 p-3 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Alerta Ética Deontológica: Posible Conflicto de Interés Detectado
                    </div>

                    {conflictResult.opposing_party_matches.length > 0 && (
                        <div>
                            <p className="font-medium text-amber-800 dark:text-amber-300">
                                Coincidencia con <strong>Contraparte procesal</strong> en expedientes activos:
                            </p>
                            <ul className="list-disc pl-4 text-amber-900 dark:text-amber-200 mt-1 space-y-0.5">
                                {conflictResult.opposing_party_matches.map((m) => (
                                    <li key={m.case_id}>
                                        Contraparte <strong>{m.opposing_party}</strong> en <em>{m.case_title}</em>
                                        {m.judicial_file_number ? ` (Exp. Judicial ${m.judicial_file_number})` : ""}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {conflictResult.client_matches.length > 0 && (
                        <div>
                            <p className="font-medium text-amber-800 dark:text-amber-300">
                                Coincidencia con <strong>Cliente activo</strong> del despacho:
                            </p>
                            <ul className="list-disc pl-4 text-amber-900 dark:text-amber-200 mt-1 space-y-0.5">
                                {conflictResult.client_matches.map((c) => (
                                    <li key={c.client_id}>
                                        <strong>{c.business_name || c.full_name}</strong>
                                        {c.rfc ? ` (RFC: ${c.rfc})` : ""}
                                        {c.match_reason ? ` — ${c.match_reason}` : ""}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Correo Institucional / Contacto</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="contacto@empresa.mx"
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone_number">Teléfono / Celular</Label>
                    <Input
                        id="phone_number"
                        name="phone_number"
                        placeholder="55 1234 5678"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="rfc">
                        RFC ({formData.client_type === "MORAL" ? "12 caracteres (Moral)" : "13 caracteres (Física)"})
                    </Label>
                    <Input
                        id="rfc"
                        name="rfc"
                        maxLength={formData.client_type === "MORAL" ? 12 : 13}
                        placeholder={formData.client_type === "MORAL" ? "IDB160921KL8" : "HESM850412AB1"}
                        value={formData.rfc}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="address">Domicilio Procesal / Convencional</Label>
                    <Input
                        id="address"
                        name="address"
                        placeholder="Calle, Número, Colonia, Municipio, C.P."
                        value={formData.address}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="notes">Antecedentes Jurídicos y Notas Confidenciales</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Observaciones relevantes sobre poderes notariales, facultades de pleitos y cobranzas, etc."
                    className="min-h-[80px]"
                />
            </div>

            <div className="flex items-center space-x-2 pt-1">
                <Switch
                    id="can_view_billing"
                    checked={formData.can_view_billing}
                    onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, can_view_billing: checked }))
                    }
                />
                <Label htmlFor="can_view_billing" className="text-sm font-normal cursor-pointer">
                    Habilitar consulta de Estado de Cuenta en el Portal del Cliente
                </Label>
            </div>

            <DialogFooter className="mt-2">
                <Button type="button" variant="outline" onClick={onFinish}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar Cliente"}
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function ClientsPage() {
    const [clients, setClients] = useState<ClientRecord[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
    const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [clientCases, setClientCases] = useState<Case[]>([]);
    const [clientDocuments, setClientDocuments] = useState<Document[]>([]);
    const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
    const [loadingCases, setLoadingCases] = useState(false);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const data = await getClients(API_URL);
                setClients(data);
                if (data.length > 0 && !selectedClient) {
                    setSelectedClient(data[0]);
                }
            } catch {
                toast.error("Error al cargar clientes");
            }
        };
        fetchClients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedClient) return;

        const fetchClientData = async () => {
            setLoadingCases(true);
            try {
                const cases: Case[] = await getCases(API_URL, selectedClient.id);
                setClientCases(cases);

                setLoadingDocuments(true);
                try {
                    const docsPerCase = await Promise.all(
                        cases.map((caso) => getDocumentsForCase(caso.id, API_URL))
                    );
                    setClientDocuments(docsPerCase.flat());
                } catch (err) {
                    console.error("Error al cargar documentos:", err);
                    setClientDocuments([]);
                } finally {
                    setLoadingDocuments(false);
                }
            } catch (err) {
                console.error("Error al cargar casos:", err);
                setClientCases([]);
                setClientDocuments([]);
            } finally {
                setLoadingCases(false);
            }

            setLoadingInvoices(true);
            try {
                const invoices = await getInvoices(API_URL);
                setClientInvoices(invoices.filter((inv) => inv.client_id === selectedClient.id));
            } catch (err) {
                console.error("Error al cargar estados de cuenta:", err);
                setClientInvoices([]);
            } finally {
                setLoadingInvoices(false);
            }
        };

        fetchClientData();
    }, [selectedClient]);

    const handleSaveClient = async (clientData: Omit<ClientRecord, "id">) => {
        try {
            if (editingClient) {
                const updated = await updateClient(editingClient.id, clientData, API_URL);
                setClients((prev) => prev.map((c) => (c.id === editingClient.id ? updated : c)));
                setSelectedClient(updated);
                toast.success("Datos del cliente actualizados");
            } else {
                const created = await createClient(clientData, API_URL);
                setClients((prev) => [created, ...prev]);
                setSelectedClient(created);
                toast.success("Cliente registrado exitosamente");
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al guardar el cliente");
            throw err;
        }
    };

    const handleDeleteClient = async (clientId: number) => {
        try {
            await deleteClient(clientId, API_URL);
            const newClients = clients.filter((c) => c.id !== clientId);
            setClients(newClients);
            if (selectedClient?.id === clientId) {
                setSelectedClient(newClients[0] || null);
            }
            toast.success("Cliente dado de baja del directorio");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo dar de baja al cliente");
        }
    };

    const handleDownloadDoc = async (doc: Document) => {
        try {
            const { download_url } = await getDownloadUrl(doc.id, API_URL);
            window.open(download_url, "_blank", "noopener,noreferrer");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo descargar el documento");
        }
    };

    const filteredClients = clients.filter(
        (client) =>
            client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.rfc?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4 h-full lg:h-[calc(100vh-7rem)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Cartera de Clientes</h1>
                    <p className="text-muted-foreground">
                        Administra a tus representados, habilita su acceso al Portal del Cliente y consulta su historial procesal.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
                {/* Lista de Clientes */}
                <Card
                    className={`lg:col-span-4 flex flex-col h-[500px] lg:h-full min-h-0 ${
                        selectedClient ? "hidden lg:flex" : "flex"
                    }`}
                >
                    <div className="p-4 border-b space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre, correo o RFC..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={() => {
                                    setEditingClient(null);
                                    setIsModalOpen(true);
                                }}
                                className="shrink-0"
                            >
                                <Plus className="h-4 w-4 mr-1.5" />
                                <span className="hidden sm:inline">Nuevo</span>
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ScrollArea className="h-full">
                            <div className="divide-y">
                                {filteredClients.map((client) => (
                                    <div
                                        key={client.id}
                                        className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                                            selectedClient?.id === client.id ? "bg-accent" : ""
                                        }`}
                                        onClick={() => setSelectedClient(client)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {client.client_type === "MORAL" ? (
                                                        <Building2 className="h-4 w-4 text-primary" />
                                                    ) : (
                                                        client.full_name.substring(0, 2).toUpperCase()
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{client.business_name || client.full_name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0 font-normal">
                                                        {client.client_type === "MORAL" ? "Moral" : "Física"}
                                                    </Badge>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {client.rfc || client.email || "Sin correo"}
                                                    </p>
                                                </div>
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
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        No se encontraron clientes registrados.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </Card>

                {/* Detalle del Cliente */}
                <Card
                    className={`lg:col-span-8 flex flex-col h-full min-h-0 ${
                        selectedClient ? "flex" : "hidden lg:flex"
                    }`}
                >
                    {selectedClient ? (
                        <div className="flex flex-col h-full">
                            <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex gap-4 w-full sm:w-auto">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="lg:hidden shrink-0"
                                        onClick={() => setSelectedClient(null)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                                        <AvatarFallback className="text-lg bg-primary/15 text-primary font-bold">
                                            {selectedClient.client_type === "MORAL" ? (
                                                <Building2 className="h-7 w-7 text-primary" />
                                            ) : (
                                                selectedClient.full_name.substring(0, 2).toUpperCase()
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-xl sm:text-2xl font-bold truncate">
                                                {selectedClient.business_name || selectedClient.full_name}
                                            </h2>
                                            <Badge
                                                variant={selectedClient.client_type === "MORAL" ? "default" : "secondary"}
                                                className="text-xs"
                                            >
                                                {selectedClient.client_type === "MORAL" ? "Persona Moral" : "Persona Física"}
                                            </Badge>
                                        </div>
                                        {selectedClient.client_type === "MORAL" && selectedClient.representative_name && (
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                                                Apoderado / Representante Legal: <strong>{selectedClient.representative_name}</strong>
                                            </p>
                                        )}
                                        <p className="text-sm text-muted-foreground truncate">
                                            {selectedClient.email || "Sin correo electrónico"} {selectedClient.rfc ? `• RFC: ${selectedClient.rfc}` : ""}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2.5">
                                            <InvitationButton
                                                clientId={selectedClient.id}
                                                clientEmail={selectedClient.email || undefined}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setEditingClient(selectedClient);
                                            setIsModalOpen(true);
                                        }}
                                    >
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
                                                <AlertDialogTitle>¿Dar de baja al cliente?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Se desactivará al cliente y su acceso al Portal del Cliente (solo permitido si no cuenta con expedientes activos en trámite).
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteClient(selectedClient.id)}
                                                >
                                                    Confirmar Baja
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>

                            <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0">
                                <div className="border-b px-4 sm:px-6 overflow-x-auto">
                                    <TabsList className="h-12 gap-2 w-full justify-start sm:w-auto">
                                        <TabsTrigger value="info" className="gap-2">
                                            <UserIcon className="h-4 w-4" />
                                            <span>Ficha General</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="cases" className="gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            <span>Expedientes ({clientCases.length})</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="documents" className="gap-2">
                                            <FileText className="h-4 w-4" />
                                            <span>Documentos ({clientDocuments.length})</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="billing" className="gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            <span>Honorarios ({clientInvoices.length})</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="flex-1 min-h-0">
                                    <ScrollArea className="h-full">
                                        <div className="p-4 sm:p-6">
                                            <TabsContent value="info" className="mt-0">
                                                <div className="grid gap-6">
                                                    <div>
                                                        <h3 className="text-base font-semibold mb-3">
                                                            Datos de Personalidad Jurídica e Identificación
                                                        </h3>
                                                        <div className="grid gap-3 text-sm">
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                <div className="flex items-center gap-2 text-muted-foreground w-40">
                                                                    <UserIcon className="h-4 w-4" />
                                                                    <span>Personalidad:</span>
                                                                </div>
                                                                <span className="font-medium">
                                                                    {selectedClient.client_type === "MORAL"
                                                                        ? "Persona Moral (Sociedad Mercantil / Civil)"
                                                                        : "Persona Física (Sujeto Individual)"}
                                                                </span>
                                                            </div>
                                                            {selectedClient.client_type === "MORAL" && (
                                                                <>
                                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                        <div className="flex items-center gap-2 text-muted-foreground w-40">
                                                                            <Building2 className="h-4 w-4" />
                                                                            <span>Razón Social:</span>
                                                                        </div>
                                                                        <span className="font-semibold">
                                                                            {selectedClient.business_name || selectedClient.full_name}
                                                                        </span>
                                                                    </div>
                                                                    {selectedClient.representative_name && (
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                            <div className="flex items-center gap-2 text-muted-foreground w-40">
                                                                                <Briefcase className="h-4 w-4" />
                                                                                <span>Apoderado Legal:</span>
                                                                            </div>
                                                                            <span>{selectedClient.representative_name}</span>
                                                                        </div>
                                                                    )}
                                                                    {selectedClient.trade_name && (
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                            <div className="flex items-center gap-2 text-muted-foreground w-40">
                                                                                <FileText className="h-4 w-4" />
                                                                                <span>Nombre Comercial:</span>
                                                                            </div>
                                                                            <span>{selectedClient.trade_name}</span>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                <div className="flex items-center gap-2 text-muted-foreground w-40">
                                                                    <Mail className="h-4 w-4" />
                                                                    <span>Correo:</span>
                                                                </div>
                                                                <span className="break-all">
                                                                    {selectedClient.email || "No registrado"}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                <div className="flex items-center gap-2 text-muted-foreground w-40">
                                                                    <Phone className="h-4 w-4" />
                                                                    <span>Teléfono:</span>
                                                                </div>
                                                                <span>{selectedClient.phone_number || "No registrado"}</span>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                <div className="flex items-center gap-2 text-muted-foreground w-40">
                                                                    <MapPin className="h-4 w-4" />
                                                                    <span>Domicilio:</span>
                                                                </div>
                                                                <span>{selectedClient.address || "No registrado"}</span>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                <div className="flex items-center gap-2 text-muted-foreground w-40">
                                                                    <UserIcon className="h-4 w-4" />
                                                                    <span>RFC SAT:</span>
                                                                </div>
                                                                <span className="font-mono font-medium">{selectedClient.rfc || "No registrado"}</span>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                                <div className="flex items-center gap-2 text-muted-foreground w-40">
                                                                    <Eye className="h-4 w-4" />
                                                                    <span>Honorarios:</span>
                                                                </div>
                                                                <Badge variant="outline">
                                                                    {selectedClient.can_view_billing
                                                                        ? "Visible en Portal del Cliente"
                                                                        : "Oculto en Portal del Cliente"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    <div>
                                                        <h3 className="text-base font-semibold mb-3">
                                                            Antecedentes y Notas del Cliente
                                                        </h3>
                                                        <Card className="bg-muted/50 border-none">
                                                            <CardContent className="p-4">
                                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                                    {selectedClient.notes ||
                                                                        "Sin observaciones adicionales registradas."}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    </div>

                                                    <Separator />

                                                    <div className="grid gap-2 text-xs text-muted-foreground">
                                                        <div className="flex justify-between items-center">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                Alta en el despacho
                                                            </span>
                                                            <span className="font-medium text-foreground">
                                                                {selectedClient.created_at
                                                                    ? format(
                                                                          new Date(selectedClient.created_at),
                                                                          "d 'de' MMMM, yyyy",
                                                                          { locale: es }
                                                                      )
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                        {selectedClient.updated_at && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    Última modificación
                                                                </span>
                                                                <span className="font-medium text-foreground">
                                                                    {format(
                                                                        new Date(selectedClient.updated_at),
                                                                        "d 'de' MMMM, yyyy",
                                                                        { locale: es }
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="cases" className="mt-0">
                                                {loadingCases ? (
                                                    <div className="text-center py-12 text-sm text-muted-foreground">
                                                        Cargando expedientes...
                                                    </div>
                                                ) : clientCases.length > 0 ? (
                                                    <div className="grid gap-3">
                                                        {clientCases.map((caso) => (
                                                            <Card
                                                                key={caso.id}
                                                                onClick={() => router.push(`/dashboard/cases/${caso.id}`)}
                                                                className="hover:bg-accent/40 transition-colors cursor-pointer"
                                                            >
                                                                <CardHeader className="pb-2">
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                                {caso.legal_matter && (
                                                                                    <Badge variant="outline" className="text-xs">
                                                                                        {caso.legal_matter}
                                                                                    </Badge>
                                                                                )}
                                                                                {caso.judicial_file_number && (
                                                                                    <span className="text-xs font-mono text-muted-foreground">
                                                                                        Exp. {caso.judicial_file_number}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <CardTitle className="text-base">{caso.title}</CardTitle>
                                                                            {caso.court_name && (
                                                                                <CardDescription className="mt-0.5">
                                                                                    {caso.court_name}
                                                                                </CardDescription>
                                                                            )}
                                                                        </div>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={getCaseStatusStyle(caso.status)}
                                                                        >
                                                                            {getCaseStatusLabel(caso.status)}
                                                                        </Badge>
                                                                    </div>
                                                                </CardHeader>
                                                                {caso.description && (
                                                                    <CardContent className="pt-0">
                                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                                            {caso.description}
                                                                        </p>
                                                                    </CardContent>
                                                                )}
                                                            </Card>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <Briefcase className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-25" />
                                                        <h3 className="text-base font-semibold mb-1">Sin Expedientes</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Este cliente aún no cuenta con expedientes radicados.
                                                        </p>
                                                    </div>
                                                )}
                                            </TabsContent>

                                            <TabsContent value="documents" className="mt-0">
                                                {loadingDocuments ? (
                                                    <div className="text-center py-12 text-sm text-muted-foreground">
                                                        Cargando documentos...
                                                    </div>
                                                ) : clientDocuments.length > 0 ? (
                                                    <div className="grid gap-3">
                                                        {clientDocuments.map((doc) => (
                                                            <Card
                                                                key={doc.id}
                                                                onClick={() => handleDownloadDoc(doc)}
                                                                className="hover:bg-accent/40 transition-colors cursor-pointer"
                                                            >
                                                                <CardContent className="p-4 flex items-center justify-between gap-3">
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        <FileText className="h-7 w-7 text-primary shrink-0" />
                                                                        <div className="min-w-0">
                                                                            <p className="font-medium truncate text-sm">
                                                                                {doc.file_name}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Subido el{" "}
                                                                                {format(
                                                                                    new Date(doc.uploaded_at),
                                                                                    "d 'de' MMMM, yyyy",
                                                                                    { locale: es }
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        {doc.visible_to_client && (
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                Visible en Portal
                                                                            </Badge>
                                                                        )}
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                            <Download className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-25" />
                                                        <h3 className="text-base font-semibold mb-1">Sin Documentos</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Los documentos adjuntados en los expedientes del cliente aparecerán aquí.
                                                        </p>
                                                    </div>
                                                )}
                                            </TabsContent>

                                            <TabsContent value="billing" className="mt-0">
                                                {loadingInvoices ? (
                                                    <div className="text-center py-12 text-sm text-muted-foreground">
                                                        Cargando estados de cuenta...
                                                    </div>
                                                ) : clientInvoices.length > 0 ? (
                                                    <div className="grid gap-4">
                                                        {clientInvoices.map((invoice) => (
                                                            <Card
                                                                key={invoice.id}
                                                                onClick={() =>
                                                                    router.push(`/dashboard/billing/${invoice.id}`)
                                                                }
                                                                className="hover:bg-accent/40 transition-colors cursor-pointer"
                                                            >
                                                                <CardHeader className="pb-2">
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            <CardTitle className="text-base">
                                                                                Estado de Cuenta {invoice.invoice_number}
                                                                            </CardTitle>
                                                                            <CardDescription className="mt-0.5">
                                                                                Emisión:{" "}
                                                                                {format(
                                                                                    new Date(invoice.issue_date),
                                                                                    "d 'de' MMMM, yyyy",
                                                                                    { locale: es }
                                                                                )}
                                                                            </CardDescription>
                                                                        </div>
                                                                        <Badge
                                                                            variant={
                                                                                invoice.status === "paid"
                                                                                    ? "default"
                                                                                    : invoice.status === "overdue"
                                                                                    ? "destructive"
                                                                                    : "secondary"
                                                                            }
                                                                        >
                                                                            {INVOICE_STATUS_LABELS[invoice.status] ||
                                                                                invoice.status}
                                                                        </Badge>
                                                                    </div>
                                                                </CardHeader>
                                                                <CardContent>
                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Honorarios Pactados
                                                                            </p>
                                                                            <p className="font-semibold">
                                                                                {formatCurrencyMXN(invoice.amount)}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Saldo Pendiente
                                                                            </p>
                                                                            <p className="font-semibold text-amber-700 dark:text-amber-400">
                                                                                {formatCurrencyMXN(invoice.balance_due)}
                                                                            </p>
                                                                        </div>
                                                                        <div className="col-span-2 sm:col-span-1">
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Fecha Límite
                                                                            </p>
                                                                            <p className="font-medium">
                                                                                {invoice.due_date
                                                                                    ? format(
                                                                                          new Date(invoice.due_date),
                                                                                          "d MMM yyyy",
                                                                                          { locale: es }
                                                                                      )
                                                                                    : "Sin vencimiento fijo"}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <DollarSign className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-25" />
                                                        <h3 className="text-base font-semibold mb-1">
                                                            Sin Estados de Cuenta
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            No se han registrado honorarios para este cliente.
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
                            <p>Selecciona un cliente del directorio para consultar su expediente integral</p>
                        </div>
                    )}
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingClient ? "Editar Datos del Cliente" : "Registrar Nuevo Cliente"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingClient
                                ? "Actualiza la ficha de identificación y permisos de portal del cliente."
                                : "Captura los datos generales y verifica ausencia de conflicto de interés."}
                        </DialogDescription>
                    </DialogHeader>
                    <ClientForm
                        client={editingClient}
                        onSave={handleSaveClient}
                        onFinish={() => setIsModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
