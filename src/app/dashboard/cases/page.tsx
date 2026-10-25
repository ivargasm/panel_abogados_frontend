// app/dashboard/cases/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    FileText,
    CheckSquare,
    Briefcase,
    User as UserIcon,
    Clock,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Download,
    AlertTriangle,
    Scale,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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

import {
    API_URL,
    getCases,
    createCase,
    getClients,
    updateCase,
    assignCaseLawyer,
    updateCaseStatus,
    deleteCase,
    getCaseUpdates,
    getDocumentsForCase,
    createCaseUpdate,
    getDownloadUrl,
    getTeamMembers,
    checkConflictOfInterest,
} from "@/app/lib/api";
import { useAuthStore } from "@/app/store/Store";
import type {
    Case,
    CaseData,
    CaseUpdate,
    CaseUpdateData,
    Document,
    TeamMember,
    ConflictCheckResult,
} from "@/app/types";
import {
    CASE_STATUS_OPTIONS,
    getCaseStatusLabel,
    getCaseStatusStyle,
    LEGAL_MATTERS,
    PROCEDURAL_ROLES,
} from "@/lib/legal-domain";

type ClientOption = {
    id: number;
    full_name: string;
};

function CaseForm({
    caseItem,
    clients,
    teamMembers,
    onSave,
    onFinish,
}: {
    caseItem: Partial<Case> | null;
    clients: ClientOption[];
    teamMembers: TeamMember[];
    onSave: (caseData: CaseData) => Promise<void>;
    onFinish: () => void;
}) {
    const [caseData, setCaseData] = useState({
        title: "",
        client_id: "",
        assigned_lawyer_id: "",
        legal_matter: "Civil",
        court_name: "",
        judicial_file_number: "",
        case_number: "",
        client_procedural_role: "Actor / Demandante",
        opposing_party: "",
        description: "",
    });
    const [conflictResult, setConflictResult] = useState<ConflictCheckResult | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (caseItem) {
            setCaseData({
                title: caseItem.title || "",
                client_id: String(caseItem.client?.id || caseItem.client_id || ""),
                assigned_lawyer_id: caseItem.assigned_lawyer_id
                    ? String(caseItem.assigned_lawyer_id)
                    : "",
                legal_matter: caseItem.legal_matter || "Civil",
                court_name: caseItem.court_name || "",
                judicial_file_number: caseItem.judicial_file_number || "",
                case_number: caseItem.case_number || "",
                client_procedural_role: caseItem.client_procedural_role || "Actor / Demandante",
                opposing_party: caseItem.opposing_party || "",
                description: caseItem.description || "",
            });
        } else {
            setCaseData({
                title: "",
                client_id: "",
                assigned_lawyer_id: teamMembers[0] ? String(teamMembers[0].id) : "",
                legal_matter: "Civil",
                court_name: "",
                judicial_file_number: "",
                case_number: "",
                client_procedural_role: "Actor / Demandante",
                opposing_party: "",
                description: "",
            });
        }
    }, [caseItem, teamMembers]);

    useEffect(() => {
        const opp = caseData.opposing_party.trim();
        if (opp.length < 3) {
            setConflictResult(null);
            return;
        }
        const timer = setTimeout(async () => {
            const res = await checkConflictOfInterest(
                opp,
                {
                    excludeCaseId: caseItem?.id,
                    excludeClientId: caseData.client_id ? parseInt(caseData.client_id, 10) : undefined,
                },
                API_URL
            );
            setConflictResult(res);
        }, 350);
        return () => clearTimeout(timer);
    }, [caseData.opposing_party, caseData.client_id, caseItem?.id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCaseData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!caseData.client_id) {
            toast.error("Selecciona al cliente representado.");
            return;
        }
        setSaving(true);
        try {
            await onSave({
                title: caseData.title.trim(),
                client_id: parseInt(caseData.client_id, 10),
                assigned_lawyer_id: caseData.assigned_lawyer_id
                    ? parseInt(caseData.assigned_lawyer_id, 10)
                    : null,
                legal_matter: caseData.legal_matter || null,
                court_name: caseData.court_name.trim() || null,
                judicial_file_number: caseData.judicial_file_number.trim() || null,
                case_number: caseData.case_number.trim() || null,
                client_procedural_role: caseData.client_procedural_role || null,
                opposing_party: caseData.opposing_party.trim() || null,
                description: caseData.description.trim() || null,
            });
            onFinish();
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-2 max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid gap-2">
                <Label htmlFor="title">Rubro / Denominación del Juicio o Asunto *</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="Ej: Juicio Ordinario Civil Reivindicatorio"
                    value={caseData.title}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid gap-2">
                    <Label>Cliente Representado *</Label>
                    <Select
                        onValueChange={(value) => setCaseData((prev) => ({ ...prev, client_id: value }))}
                        value={caseData.client_id}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un cliente..." />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map((client) => (
                                <SelectItem key={client.id} value={String(client.id)}>
                                    {client.full_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label>Calidad Procesal del Cliente</Label>
                    <Select
                        onValueChange={(value) =>
                            setCaseData((prev) => ({ ...prev, client_procedural_role: value }))
                        }
                        value={caseData.client_procedural_role}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Calidad procesal..." />
                        </SelectTrigger>
                        <SelectContent>
                            {PROCEDURAL_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                    {role}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid gap-2">
                    <Label>Materia Jurídica</Label>
                    <Select
                        onValueChange={(value) => setCaseData((prev) => ({ ...prev, legal_matter: value }))}
                        value={caseData.legal_matter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Materia..." />
                        </SelectTrigger>
                        <SelectContent>
                            {LEGAL_MATTERS.map((matter) => (
                                <SelectItem key={matter} value={matter}>
                                    {matter}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label>Abogado Responsable / Colaborador</Label>
                    <Select
                        onValueChange={(value) =>
                            setCaseData((prev) => ({ ...prev, assigned_lawyer_id: value }))
                        }
                        value={caseData.assigned_lawyer_id}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Asignar abogado..." />
                        </SelectTrigger>
                        <SelectContent>
                            {teamMembers
                                .filter((m) => m.is_active)
                                .map((member) => (
                                    <SelectItem key={member.id} value={String(member.id)}>
                                        {member.full_name} ({member.role === "owner" ? "Titular" : "Colaborador"})
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="court_name">Juzgado, Tribunal o Autoridad Jurisdiccional</Label>
                <Input
                    id="court_name"
                    name="court_name"
                    placeholder="Ej: Juzgado Quinto de lo Civil de Primera Instancia"
                    value={caseData.court_name}
                    onChange={handleInputChange}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid gap-2">
                    <Label htmlFor="judicial_file_number">Expediente Judicial Oficial</Label>
                    <Input
                        id="judicial_file_number"
                        name="judicial_file_number"
                        placeholder="Ej: 482/2026"
                        value={caseData.judicial_file_number}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="case_number">Control Interno del Despacho</Label>
                    <Input
                        id="case_number"
                        name="case_number"
                        placeholder="Ej: EXP-CIV-004"
                        value={caseData.case_number}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="opposing_party">Contraparte / Autoridad Responsable</Label>
                <Input
                    id="opposing_party"
                    name="opposing_party"
                    placeholder="Nombre de la parte contraria o autoridad señalada"
                    value={caseData.opposing_party}
                    onChange={handleInputChange}
                />
            </div>

            {conflictResult && conflictResult.client_matches.length > 0 && (
                <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-3 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-red-900 dark:text-red-300">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Alerta de Conflicto de Interés (Secreto Profesional)
                    </div>
                    <p className="text-red-800 dark:text-red-200">
                        La contraparte ingresada coincide con un <strong>Cliente Activo</strong> registrado en tu despacho:
                    </p>
                    <ul className="list-disc pl-4 text-red-900 dark:text-red-200">
                        {conflictResult.client_matches.map((c) => (
                            <li key={c.client_id}>
                                <strong>{c.full_name}</strong>
                                {c.rfc ? ` (RFC: ${c.rfc})` : ""}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="description">Síntesis de Pretensiones y Hechos</Label>
                <Textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Prestaciones reclamadas, vía procesal y observaciones iniciales..."
                    value={caseData.description}
                    onChange={handleInputChange}
                />
            </div>

            <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={onFinish}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar Expediente"}
                </Button>
            </DialogFooter>
        </form>
    );
}

function UpdateForm({
    onSave,
    onFinish,
}: {
    onSave: (updateData: CaseUpdateData) => Promise<void>;
    onFinish: () => void;
}) {
    const [updateData, setUpdateData] = useState<CaseUpdateData>({
        update_text: "",
        visible_to_client: true,
        status: "En Proceso",
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(updateData);
            onFinish();
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
            <div className="grid gap-2">
                <Label htmlFor="update_text">Acuerdo, Promoción o Actuación Procesal *</Label>
                <Textarea
                    id="update_text"
                    rows={4}
                    placeholder="Ej: Se publicó auto admisorio en Boletín Judicial; se ordena emplazar a la parte demandada..."
                    value={updateData.update_text}
                    onChange={(e) =>
                        setUpdateData((prev) => ({ ...prev, update_text: e.target.value }))
                    }
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label>Estado de la Diligencia</Label>
                <Select
                    value={updateData.status}
                    onValueChange={(value: CaseUpdateData["status"]) =>
                        setUpdateData((prev) => ({ ...prev, status: value }))
                    }
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
                <Switch
                    id="visible_to_client"
                    checked={updateData.visible_to_client}
                    onCheckedChange={(checked) =>
                        setUpdateData((prev) => ({ ...prev, visible_to_client: checked }))
                    }
                />
                <Label htmlFor="visible_to_client" className="cursor-pointer font-normal text-sm">
                    Notificar y mostrar en el Portal del Cliente
                </Label>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onFinish}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                    {saving ? "Registrando..." : "Registrar Actuación"}
                </Button>
            </DialogFooter>
        </form>
    );
}

function Timeline({
    caseItem,
    updates,
    documents,
}: {
    caseItem: Case;
    updates: CaseUpdate[];
    documents: Document[];
}) {
    const events = [
        {
            type: "created",
            date: caseItem.created_at,
            title: "Radicación de Expediente en Despacho",
            description: `Apertura de expediente para ${caseItem.client.full_name}`,
            icon: Briefcase,
        },
        ...updates.map((update) => ({
            type: "update",
            date: update.created_at,
            title: "Actuación Procesal",
            description: update.update_text,
            icon: CheckSquare,
            status: update.status,
        })),
        ...documents.map((doc) => ({
            type: "document",
            date: doc.uploaded_at,
            title: "Documento Incorporado",
            description: doc.file_name,
            icon: FileText,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-5">
            {events.map((event, index) => {
                const Icon = event.icon;
                return (
                    <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div
                                className={`rounded-full p-2 ${
                                    event.type === "created"
                                        ? "bg-primary/10 text-primary"
                                        : event.type === "update"
                                        ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                            </div>
                            {index < events.length - 1 && (
                                <div className="w-px h-full bg-border mt-2" />
                            )}
                        </div>
                        <div className="flex-1 pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                                <div>
                                    <p className="font-semibold text-sm">{event.title}</p>
                                    <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">
                                        {event.description}
                                    </p>
                                    {"status" in event && event.status && (
                                        <Badge variant="outline" className="mt-2 text-xs">
                                            {event.status}
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {format(new Date(event.date), "d MMM yyyy", { locale: es })}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function CasesPage() {
    const [cases, setCases] = useState<Case[]>([]);
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [editingCase, setEditingCase] = useState<Case | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [matterFilter, setMatterFilter] = useState<string>("all");
    const [clientFilter, setClientFilter] = useState<string>("all");

    const [caseUpdates, setCaseUpdates] = useState<CaseUpdate[]>([]);
    const [caseDocuments, setCaseDocuments] = useState<Document[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const router = useRouter();
    const { user } = useAuthStore();

    const handleQuickReassignLawyer = async (caseId: number, lawyerIdStr: string) => {
        const lawyerId = parseInt(lawyerIdStr, 10);
        try {
            const updated = await assignCaseLawyer(caseId, lawyerId, API_URL);
            setCases((prev) => prev.map((c) => (c.id === caseId ? updated : c)));
            if (selectedCase?.id === caseId) {
                setSelectedCase(updated);
            }
            const lawyerName = teamMembers.find((m) => m.id === lawyerId)?.full_name || "el abogado seleccionado";
            toast.success(`Expediente reasignado exitosamente a ${lawyerName}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al reasignar el expediente");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [casesData, clientsData, teamData] = await Promise.all([
                    getCases(API_URL, null),
                    getClients(API_URL),
                    getTeamMembers(false, API_URL).catch(() => []),
                ]);
                setCases(casesData);
                setClients(clientsData);
                setTeamMembers(teamData);
                if (casesData.length > 0 && !selectedCase) {
                    setSelectedCase(casesData[0]);
                }
            } catch {
                toast.error("Error al cargar expedientes");
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedCase) return;

        const fetchCaseDetails = async () => {
            setLoadingDetails(true);
            try {
                const [updates, documents] = await Promise.all([
                    getCaseUpdates(selectedCase.id, API_URL),
                    getDocumentsForCase(selectedCase.id, API_URL),
                ]);
                setCaseUpdates(updates);
                setCaseDocuments(documents);
            } catch (err) {
                console.error("Error al cargar detalles del expediente:", err);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchCaseDetails();
    }, [selectedCase]);

    const handleSaveCase = async (caseData: CaseData) => {
        try {
            if (editingCase) {
                const updated = await updateCase(editingCase.id, caseData, API_URL);
                setCases((prev) => prev.map((c) => (c.id === editingCase.id ? updated : c)));
                if (selectedCase?.id === editingCase.id) {
                    setSelectedCase(updated);
                }
                toast.success("Carátula del expediente actualizada");
            } else {
                const created = await createCase(caseData, API_URL);
                setCases((prev) => [created, ...prev]);
                setSelectedCase(created);
                toast.success("Expediente radicado exitosamente");
            }
            const refreshedCases = await getCases(API_URL, null);
            setCases(refreshedCases);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al guardar el expediente");
            throw err;
        }
    };

    const handleCreateUpdate = async (updateData: CaseUpdateData) => {
        if (!selectedCase) return;
        try {
            await createCaseUpdate(selectedCase.id, updateData, API_URL);
            const updates = await getCaseUpdates(selectedCase.id, API_URL);
            setCaseUpdates(updates);
            toast.success("Actuación registrada en el expediente");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al registrar actuación");
            throw err;
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedCase) return;
        try {
            const updated = await updateCaseStatus(selectedCase.id, newStatus, API_URL);
            setCases((prev) => prev.map((c) => (c.id === selectedCase.id ? updated : c)));
            setSelectedCase(updated);
            toast.success("Etapa procesal actualizada");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al actualizar la etapa procesal");
        }
    };

    const handleDeleteCase = async (caseId: number) => {
        try {
            await deleteCase(caseId, API_URL);
            const newCases = cases.filter((c) => c.id !== caseId);
            setCases(newCases);
            if (selectedCase?.id === caseId) {
                setSelectedCase(newCases[0] || null);
            }
            toast.success("Expediente archivado correctamente");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo archivar el expediente");
        }
    };

    const handleDownloadDocument = async (doc: Document) => {
        try {
            const { download_url } = await getDownloadUrl(doc.id, API_URL);
            window.open(download_url, "_blank", "noopener,noreferrer");
        } catch {
            toast.error("No se pudo descargar el documento");
        }
    };

    const filteredCases = React.useMemo(() => {
        return cases.filter((caseItem) => {
            const q = searchTerm.toLowerCase();
            const matchesSearch =
                caseItem.title.toLowerCase().includes(q) ||
                caseItem.client.full_name.toLowerCase().includes(q) ||
                (caseItem.judicial_file_number || "").toLowerCase().includes(q) ||
                (caseItem.case_number || "").toLowerCase().includes(q) ||
                (caseItem.court_name || "").toLowerCase().includes(q) ||
                (caseItem.opposing_party || "").toLowerCase().includes(q);
            const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
            const matchesMatter = matterFilter === "all" || caseItem.legal_matter === matterFilter;
            const matchesClient =
                clientFilter === "all" || String(caseItem.client.id) === clientFilter;
            return matchesSearch && matchesStatus && matchesMatter && matchesClient;
        });
    }, [cases, searchTerm, statusFilter, matterFilter, clientFilter]);

    useEffect(() => {
        if (filteredCases.length > 0) {
            const isSelectedInList =
                selectedCase && filteredCases.some((c) => c.id === selectedCase.id);
            if (selectedCase && !isSelectedInList) {
                setSelectedCase(filteredCases[0]);
            }
        } else {
            setSelectedCase(null);
        }
    }, [filteredCases, selectedCase]);

    return (
        <div className="flex flex-col gap-4 h-full lg:h-[calc(100vh-7rem)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Expedientes Jurídicos</h1>
                    <p className="text-muted-foreground">
                        Control procesal por materia, juzgado, contraparte, actuaciones y abogado responsable.
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setEditingCase(null);
                        setIsModalOpen(true);
                    }}
                    className="shrink-0"
                >
                    <Plus className="h-4 w-4 mr-2" /> Nuevo Expediente
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por rubro, núm. de expediente judicial, juzgado, cliente o contraparte..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Select value={matterFilter} onValueChange={setMatterFilter}>
                        <SelectTrigger className="w-[155px]">
                            <SelectValue placeholder="Materia" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las Materias</SelectItem>
                            {LEGAL_MATTERS.map((m) => (
                                <SelectItem key={m} value={m}>
                                    {m}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[210px]">
                            <SelectValue placeholder="Etapa Procesal" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las Etapas</SelectItem>
                            {CASE_STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={clientFilter} onValueChange={setClientFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Clientes</SelectItem>
                            {clients.map((client) => (
                                <SelectItem key={client.id} value={String(client.id)}>
                                    {client.full_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
                {/* Lista de Expedientes */}
                <Card
                    className={`lg:col-span-5 flex flex-col h-[500px] lg:h-full min-h-0 ${
                        selectedCase ? "hidden lg:flex" : "flex"
                    }`}
                >
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Índice de Expedientes</CardTitle>
                        <CardDescription>
                            {filteredCases.length} expediente{filteredCases.length !== 1 ? "s" : ""} encontrado
                            {filteredCases.length !== 1 ? "s" : ""}
                        </CardDescription>
                    </CardHeader>
                    <div className="flex-1 min-h-0">
                        <ScrollArea className="h-full">
                            <div className="divide-y px-4">
                                {filteredCases.map((caseItem) => (
                                    <div
                                        key={caseItem.id}
                                        className={`py-3.5 cursor-pointer hover:bg-accent/50 transition-colors px-3 -mx-3 rounded-md ${
                                            selectedCase?.id === caseItem.id ? "bg-accent" : ""
                                        }`}
                                        onClick={() => setSelectedCase(caseItem)}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {caseItem.legal_matter && (
                                                        <Badge variant="secondary" className="text-[11px]">
                                                            {caseItem.legal_matter}
                                                        </Badge>
                                                    )}
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[11px] ${getCaseStatusStyle(
                                                            caseItem.status
                                                        )}`}
                                                    >
                                                        {getCaseStatusLabel(caseItem.status)}
                                                    </Badge>
                                                </div>
                                                <p className="font-semibold text-sm truncate">
                                                    {caseItem.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    Cliente: <span className="font-medium text-foreground/80">{caseItem.client.full_name}</span>
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                    {caseItem.judicial_file_number && (
                                                        <span>Exp. Jud: {caseItem.judicial_file_number}</span>
                                                    )}
                                                    {caseItem.court_name && (
                                                        <span className="truncate max-w-[220px]">
                                                            • {caseItem.court_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="lg:hidden self-center">
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredCases.length === 0 && (
                                    <div className="py-12 text-center text-muted-foreground text-sm">
                                        No se encontraron expedientes con esos criterios.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </Card>

                {/* Vista Rápida / Carátula Procesal */}
                <Card
                    className={`lg:col-span-7 flex flex-col h-full min-h-0 ${
                        selectedCase ? "flex" : "hidden lg:flex"
                    }`}
                >
                    {selectedCase ? (
                        <div className="flex flex-col h-full">
                            <div className="p-4 sm:p-6 border-b">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="lg:hidden shrink-0"
                                                onClick={() => setSelectedCase(null)}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    {selectedCase.legal_matter && (
                                                        <Badge variant="secondary">
                                                            Materia {selectedCase.legal_matter}
                                                        </Badge>
                                                    )}
                                                    {selectedCase.judicial_file_number && (
                                                        <Badge variant="outline" className="font-mono">
                                                            Exp. {selectedCase.judicial_file_number}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h2 className="text-xl sm:text-2xl font-bold truncate">
                                                    {selectedCase.title}
                                                </h2>
                                                {selectedCase.court_name && (
                                                    <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
                                                        <Scale className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="truncate">{selectedCase.court_name}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    setEditingCase(selectedCase);
                                                    setIsModalOpen(true);
                                                }}
                                                title="Editar carátula"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        title="Archivar expediente"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Archivar expediente?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            El expediente pasará al archivo histórico inactivo (se requiere que no tenga audiencias pendientes ni estados de cuenta por liquidar).
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteCase(selectedCase.id)}
                                                        >
                                                            Archivar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full sm:w-fit"
                                        onClick={() => router.push(`/dashboard/cases/${selectedCase.id}`)}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Abrir Expediente Completo / Carátula PDF
                                    </Button>
                                </div>
                            </div>

                            <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                                <div className="border-b px-4 sm:px-6 overflow-x-auto">
                                    <TabsList className="h-12 gap-2 w-full justify-start sm:w-auto">
                                        <TabsTrigger value="overview" className="gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            <span>Carátula Procesal</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="updates" className="gap-2">
                                            <CheckSquare className="h-4 w-4" />
                                            <span>Actuaciones ({caseUpdates.length})</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="documents" className="gap-2">
                                            <FileText className="h-4 w-4" />
                                            <span>Documentos ({caseDocuments.length})</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="flex-1 min-h-0">
                                    <ScrollArea className="h-full">
                                        <div className="p-4 sm:p-6">
                                            <TabsContent value="overview" className="mt-0">
                                                <div className="space-y-6">
                                                    <div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                                            <h3 className="text-base font-semibold">
                                                                Datos Procesales
                                                            </h3>
                                                            <Select
                                                                value={selectedCase.status}
                                                                onValueChange={handleStatusChange}
                                                            >
                                                                <SelectTrigger className="w-full sm:w-[250px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {CASE_STATUS_OPTIONS.map((opt) => (
                                                                        <SelectItem
                                                                            key={opt.value}
                                                                            value={opt.value}
                                                                        >
                                                                            {opt.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Representado (Cliente)
                                                                </p>
                                                                <p className="font-semibold">
                                                                    {selectedCase.client.full_name}
                                                                </p>
                                                                {selectedCase.client_procedural_role && (
                                                                    <span className="text-xs text-primary font-medium">
                                                                        {selectedCase.client_procedural_role}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Contraparte / Autoridad
                                                                </p>
                                                                <p className="font-medium">
                                                                    {selectedCase.opposing_party || "No especificada"}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground mb-1">
                                                                    Abogado Responsable
                                                                </p>
                                                                {user?.role === "owner" && teamMembers.length > 0 ? (
                                                                    <div className="space-y-1">
                                                                        <Select
                                                                            value={String(selectedCase.assigned_lawyer_id || "")}
                                                                            onValueChange={(val) => handleQuickReassignLawyer(selectedCase.id, val)}
                                                                        >
                                                                            <SelectTrigger className="h-7 w-auto min-w-[190px] text-xs font-semibold bg-background">
                                                                                <SelectValue placeholder="Reasignar abogado..." />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {teamMembers
                                                                                    .filter((m) => m.is_active)
                                                                                    .map((m) => (
                                                                                        <SelectItem key={m.id} value={String(m.id)}>
                                                                                            {m.full_name} ({m.role === "owner" ? "Titular" : "Colaborador"})
                                                                                        </SelectItem>
                                                                                    ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        {selectedCase.assigned_lawyer?.professional_license && (
                                                                            <span className="text-xs text-muted-foreground block">
                                                                                Cédula: {selectedCase.assigned_lawyer.professional_license}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {selectedCase.assigned_lawyer?.full_name || "Titular del Despacho"}
                                                                        </p>
                                                                        {selectedCase.assigned_lawyer?.professional_license && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                Cédula: {selectedCase.assigned_lawyer.professional_license}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Control Interno / Apertura
                                                                </p>
                                                                <p className="font-medium">
                                                                    {selectedCase.case_number || "S/N"} •{" "}
                                                                    {format(
                                                                        new Date(selectedCase.created_at),
                                                                        "d MMM yyyy",
                                                                        { locale: es }
                                                                    )}
                                                                </p>
                                                            </div>
                                                            {selectedCase.description && (
                                                                <div className="sm:col-span-2 pt-2 border-t">
                                                                    <p className="text-xs text-muted-foreground mb-1">
                                                                        Síntesis del Litigio / Asunto
                                                                    </p>
                                                                    <p className="text-sm whitespace-pre-wrap">
                                                                        {selectedCase.description}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    <div>
                                                        <h3 className="text-base font-semibold mb-4">
                                                            Cronología del Expediente
                                                        </h3>
                                                        {loadingDetails ? (
                                                            <div className="text-center py-8 text-sm text-muted-foreground">
                                                                Cargando bitácora...
                                                            </div>
                                                        ) : (
                                                            <Timeline
                                                                caseItem={selectedCase}
                                                                updates={caseUpdates}
                                                                documents={caseDocuments}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="updates" className="mt-0">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-base font-semibold">
                                                            Bitácora de Actuaciones
                                                        </h3>
                                                        <Button
                                                            onClick={() => setIsUpdateModalOpen(true)}
                                                            size="sm"
                                                        >
                                                            <Plus className="h-4 w-4 mr-1.5" />
                                                            Nueva Actuación
                                                        </Button>
                                                    </div>

                                                    {caseUpdates.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {caseUpdates.map((update) => (
                                                                <Card key={update.id}>
                                                                    <CardContent className="p-4">
                                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                                            <p className="text-sm font-medium whitespace-pre-wrap">
                                                                                {update.update_text}
                                                                            </p>
                                                                            <Badge variant="outline" className="shrink-0">
                                                                                {update.status}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                                            <span className="flex items-center gap-1">
                                                                                <UserIcon className="h-3 w-3" />
                                                                                {update.created_by.full_name}
                                                                            </span>
                                                                            <span className="flex items-center gap-1">
                                                                                <Clock className="h-3 w-3" />
                                                                                {format(
                                                                                    new Date(update.created_at),
                                                                                    "d MMM yyyy",
                                                                                    { locale: es }
                                                                                )}
                                                                            </span>
                                                                            {update.visible_to_client && (
                                                                                <Badge
                                                                                    variant="secondary"
                                                                                    className="text-[11px]"
                                                                                >
                                                                                    Visible en Portal
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-10 border rounded-lg border-dashed">
                                                            <p className="text-sm text-muted-foreground mb-3">
                                                                Sin actuaciones registradas en este expediente.
                                                            </p>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setIsUpdateModalOpen(true)}
                                                            >
                                                                Registrar Primera Actuación
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="documents" className="mt-0">
                                                {caseDocuments.length > 0 ? (
                                                    <div className="space-y-2.5">
                                                        {caseDocuments.map((doc) => (
                                                            <Card
                                                                key={doc.id}
                                                                onClick={() => handleDownloadDocument(doc)}
                                                                className="hover:bg-accent/40 transition-colors cursor-pointer"
                                                            >
                                                                <CardContent className="p-3.5 flex items-center justify-between gap-3">
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        <FileText className="h-6 w-6 text-primary shrink-0" />
                                                                        <div className="min-w-0">
                                                                            <p className="text-sm font-medium truncate">
                                                                                {doc.file_name}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {format(
                                                                                    new Date(doc.uploaded_at),
                                                                                    "d MMM yyyy",
                                                                                    { locale: es }
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10">
                                                        <p className="text-sm text-muted-foreground mb-3">
                                                            Para subir o compartir promociones con el cliente, abre el expediente completo.
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                router.push(`/dashboard/cases/${selectedCase.id}`)
                                                            }
                                                        >
                                                            Ir al Expediente Digital
                                                        </Button>
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
                            <Briefcase className="h-16 w-16 mb-4 opacity-20" />
                            <p>Selecciona un expediente para consultar su carátula procesal</p>
                        </div>
                    )}
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[620px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCase
                                ? "Editar Carátula Procesal del Expediente"
                                : "Radicar Nuevo Expediente"}
                        </DialogTitle>
                        <DialogDescription>
                            Captura los datos de identificación jurisdiccional, partes procesales y abogado responsable.
                        </DialogDescription>
                    </DialogHeader>
                    <CaseForm
                        caseItem={editingCase}
                        clients={clients}
                        teamMembers={teamMembers}
                        onSave={handleSaveCase}
                        onFinish={() => setIsModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Registrar Actuación Procesal</DialogTitle>
                    </DialogHeader>
                    {selectedCase && (
                        <UpdateForm
                            onSave={handleCreateUpdate}
                            onFinish={() => setIsUpdateModalOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
