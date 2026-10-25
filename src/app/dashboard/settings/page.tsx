"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    User,
    Settings,
    Lock,
    CreditCard,
    Check,
    Users,
    Plus,
    Pencil,
    UserX,
    UserCheck,
    Building2,
    Award,
    Sun,
    Moon,
    Copy,
    RotateCcw,
    Trash2,
    Clock,
    FileText,
    Upload,
    Loader2,
    X,
    FileCheck,
} from "lucide-react";
import { useAuthStore } from "@/app/store/Store";
import { toast } from "sonner";
import {
    API_URL,
    createCheckoutSession,
    createCustomerPortalSession,
    getTeamMembers,
    updateTeamMember,
    deactivateTeamMember,
    updateWorkspaceName,
    inviteTeamMember,
    getTeamInvitations,
    resendTeamInvitation,
    cancelTeamInvitation,
    updateUserProfile,
    changePassword,
    initiateProfilePictureUpload,
    uploadFileToS3,
    uploadAndParseCredential,
    getMemberCredentialUrl,
} from "@/app/lib/api";
import type { TeamMember, TeamInvitation } from "@/app/types";

type Section = "profile" | "team" | "general" | "security" | "subscription";

export default function SettingsLayout() {
    const [activeSection, setActiveSection] = useState<Section>("profile");

    const menuItems = [
        { id: "profile" as Section, label: "Perfil Profesional", icon: User },
        { id: "team" as Section, label: "Equipo y Colaboradores", icon: Users },
        { id: "general" as Section, label: "Despacho y Apariencia", icon: Building2 },
        { id: "security" as Section, label: "Seguridad", icon: Lock },
        { id: "subscription" as Section, label: "Suscripción", icon: CreditCard },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-8 w-full">
            <aside className="md:w-64 flex-shrink-0">
                <nav className="flex flex-col space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Button
                                key={item.id}
                                variant={activeSection === item.id ? "secondary" : "ghost"}
                                className={`justify-start ${
                                    activeSection === item.id
                                        ? "font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                                onClick={() => setActiveSection(item.id)}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Button>
                        );
                    })}
                </nav>
            </aside>

            <div className="flex-1 min-w-0">
                {activeSection === "profile" && <ProfileSection />}
                {activeSection === "team" && <TeamSection />}
                {activeSection === "general" && <GeneralSection />}
                {activeSection === "security" && <SecuritySection />}
                {activeSection === "subscription" && <SubscriptionSection />}
            </div>
        </div>
    );
}

function GeneralSection() {
    const { user, setUser } = useAuthStore();
    const isOwner = user?.role === "owner";
    const [workspaceName, setWorkspaceName] = useState(user?.workspace_name || "");
    const [savingWorkspace, setSavingWorkspace] = useState(false);

    useEffect(() => {
        if (user?.workspace_name) {
            setWorkspaceName(user.workspace_name);
        }
    }, [user?.workspace_name]);

    const handleSaveWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workspaceName.trim()) {
            toast.error("El nombre del despacho no puede estar vacío");
            return;
        }
        setSavingWorkspace(true);
        try {
            const res = await updateWorkspaceName(workspaceName.trim(), API_URL);
            if (user) {
                setUser({ ...user, workspace_name: res.name });
            }
            toast.success("Nombre del despacho actualizado");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al actualizar el despacho");
        } finally {
            setSavingWorkspace(false);
        }
    };

    const setTheme = (mode: "light" | "dark") => {
        if (mode === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Despacho y Apariencia</h1>
                <p className="text-muted-foreground">
                    Configura la razón o denominación del despacho que aparece en carátulas, estados de cuenta y el Portal del Cliente.
                </p>
            </div>
            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                        Identidad del Despacho Jurídico
                    </CardTitle>
                    <CardDescription>
                        Este nombre encabeza los reportes imprimibles (PDF) y las notificaciones enviadas a tus representados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveWorkspace} className="space-y-4">
                        <div className="space-y-2 max-w-xl">
                            <Label htmlFor="workspace_name">Nombre o Denominación del Despacho</Label>
                            <Input
                                id="workspace_name"
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                                placeholder="Ej: Bufete Jurídico Vargas & Asociados, S.C."
                                disabled={!isOwner}
                            />
                            {!isOwner && (
                                <p className="text-xs text-muted-foreground">
                                    Solo el titular del despacho puede modificar la denominación oficial.
                                </p>
                            )}
                        </div>
                        {isOwner && (
                            <Button type="submit" disabled={savingWorkspace}>
                                {savingWorkspace ? "Guardando..." : "Guardar Nombre del Despacho"}
                            </Button>
                        )}
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Settings className="h-5 w-5 text-primary" />
                        Preferencias de Interfaz
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Tema Visual</Label>
                            <p className="text-sm text-muted-foreground">
                                Alterna entre interfaz clara de lectura o modo oscuro de descanso visual.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setTheme("light")}>
                                <Sun className="h-4 w-4 mr-1.5" />
                                Claro
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setTheme("dark")}>
                                <Moon className="h-4 w-4 mr-1.5" />
                                Oscuro
                            </Button>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Jurisdicción e Idioma</Label>
                            <p className="text-sm text-muted-foreground">
                                Nomenclatura procesal configurada para práctica jurídica en México.
                            </p>
                        </div>
                        <Badge variant="secondary">Español (México)</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ProfileSection() {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || "",
        phone_number: user?.phone_number || "",
        job_title: user?.job_title || "",
        professional_license: user?.professional_license || "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || "",
                phone_number: user.phone_number || "",
                job_title: user.job_title || "",
                professional_license: user.professional_license || "",
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatedUser = await updateUserProfile(formData, API_URL);
            setUser({ ...user, ...updatedUser });
            toast.success("Perfil profesional actualizado correctamente");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo actualizar tu perfil.");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("El archivo es demasiado grande. Máximo 5 MB.");
            return;
        }
        if (!file.type.startsWith("image/")) {
            toast.error("Solo se permiten archivos de imagen.");
            return;
        }

        const toastId = toast.loading("Subiendo fotografía profesional...");
        try {
            const { upload_url, file_path } = await initiateProfilePictureUpload(
                file.name,
                file.type,
                file.size,
                API_URL
            );
            await uploadFileToS3(upload_url, file);
            const updatedUser = await updateUserProfile({ profile_picture_url: file_path }, API_URL);
            setUser({ ...user, ...updatedUser });
            toast.success("Fotografía actualizada", { id: toastId });
        } catch {
            toast.error("Error al subir la fotografía", { id: toastId });
        } finally {
            e.target.value = "";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Perfil Profesional</h1>
                <p className="text-muted-foreground">
                    Tus datos profesionales y Cédula se muestran a los clientes asignados a tus expedientes.
                </p>
            </div>
            <Separator />

            <Card>
                <CardContent className="p-6 space-y-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user?.profile_picture_url || ""} alt="Avatar" />
                            <AvatarFallback className="text-lg bg-primary/15 text-primary font-bold">
                                {user?.full_name ? getInitials(user.full_name) : "AB"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 text-center sm:text-left flex-1">
                            <h3 className="text-xl font-semibold">{user?.full_name || "Abogado"}</h3>
                            <p className="text-sm text-muted-foreground">
                                {user?.job_title || (user?.role === "owner" ? "Socio Titular" : "Abogado Colaborador")}
                            </p>
                            {user?.professional_license && (
                                <Badge variant="secondary" className="gap-1">
                                    <Award className="h-3.5 w-3.5" />
                                    Cédula Prof. {user.professional_license}
                                </Badge>
                            )}
                        </div>
                        <div>
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="outline"
                                onClick={() => document.getElementById("avatar-upload")?.click()}
                            >
                                Cambiar fotografía
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h3 className="text-lg font-medium">Datos de Identificación</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Nombre Completo (con título)</Label>
                                <Input
                                    id="full_name"
                                    placeholder="Ej: Lic. Iván Vargas"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="job_title">Cargo en el Despacho</Label>
                                <Input
                                    id="job_title"
                                    placeholder="Ej: Socio Director / Abogado Litigante"
                                    value={formData.job_title}
                                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="professional_license">Cédula Profesional (SEP / DGP)</Label>
                                <Input
                                    id="professional_license"
                                    placeholder="Ej: 12849302 (o 'En trámite' si eres pasante)"
                                    value={formData.professional_license}
                                    onChange={(e) =>
                                        setFormData({ ...formData, professional_license: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone_number">Teléfono de Contacto</Label>
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    placeholder="Ej: 55 1234 5678"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico Institucional</Label>
                            <Input id="email" type="email" value={user?.email || ""} disabled />
                        </div>

                        <div className="flex justify-end gap-4 pt-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function TeamSection() {
    const { user } = useAuthStore();
    const isOwner = user?.role === "owner";
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [extractingCedula, setExtractingCedula] = useState(false);
    const [extractedCedulaMsg, setExtractedCedulaMsg] = useState<string | null>(null);

    const [createForm, setCreateForm] = useState({
        full_name: "",
        email: "",
        job_title: "Abogado Asociado",
        professional_license: "",
        professional_license_file_path: "",
        professional_license_file_name: "",
        license_institution: "",
        phone_number: "",
    });

    const [editForm, setEditForm] = useState({
        full_name: "",
        job_title: "",
        professional_license: "",
        professional_license_file_path: "",
        professional_license_file_name: "",
        license_institution: "",
        phone_number: "",
        new_password: "",
    });

    const handleCredentialUpload = async (file: File, isEdit: boolean) => {
        setExtractingCedula(true);
        setExtractedCedulaMsg(null);
        try {
            const res = await uploadAndParseCredential(file, API_URL);
            const { extracted_data, professional_license_file_path, professional_license_file_name } = res;
            if (isEdit) {
                setEditForm((prev) => ({
                    ...prev,
                    professional_license: extracted_data.license_number || prev.professional_license,
                    license_institution: extracted_data.institution || prev.license_institution,
                    professional_license_file_path,
                    professional_license_file_name,
                }));
            } else {
                setCreateForm((prev) => ({
                    ...prev,
                    professional_license: extracted_data.license_number || prev.professional_license,
                    license_institution: extracted_data.institution || prev.license_institution,
                    professional_license_file_path,
                    professional_license_file_name,
                }));
            }
            setExtractedCedulaMsg(
                `Credencial analizada: No. Cédula ${extracted_data.license_number || "Pendiente"} (${extracted_data.institution}). Respaldo resguardado.`
            );
            toast.success("Cédula Profesional analizada y respaldada exitosamente");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al procesar la credencial");
        } finally {
            setExtractingCedula(false);
        }
    };

    const handleViewCredential = async (memberId: number) => {
        try {
            const res = await getMemberCredentialUrl(memberId, API_URL);
            if (res.download_url) {
                window.open(res.download_url, "_blank");
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al abrir la credencial");
        }
    };

    const loadInvitations = useCallback(async () => {
        try {
            const data = await getTeamInvitations(API_URL);
            setInvitations(data);
        } catch {
            // Ignorar si no hay invitaciones o permisos
        }
    }, []);

    const loadMembers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getTeamMembers(true, API_URL);
            setMembers(data);
            await loadInvitations();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al cargar los integrantes del despacho");
        } finally {
            setLoading(false);
        }
    }, [loadInvitations]);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    const handleInviteMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await inviteTeamMember(
                {
                    full_name: createForm.full_name.trim(),
                    email: createForm.email.trim(),
                    job_title: createForm.job_title.trim() || undefined,
                    professional_license: createForm.professional_license.trim() || undefined,
                    professional_license_file_path: createForm.professional_license_file_path || undefined,
                    professional_license_file_name: createForm.professional_license_file_name || undefined,
                    license_institution: createForm.license_institution.trim() || undefined,
                    phone_number: createForm.phone_number.trim() || undefined,
                },
                API_URL
            );
            toast.success("Invitación enviada al correo del colaborador");
            setIsCreateOpen(false);
            setCreateForm({
                full_name: "",
                email: "",
                job_title: "Abogado Asociado",
                professional_license: "",
                professional_license_file_path: "",
                professional_license_file_name: "",
                license_institution: "",
                phone_number: "",
            });
            loadMembers();
            loadInvitations();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al enviar la invitación");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyInviteLink = (invToken: string | null | undefined) => {
        if (!invToken) {
            toast.error("Token no disponible");
            return;
        }
        const fullUrl = `${window.location.origin}/invitacion-colaborador?token=${invToken}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success("Enlace de activación copiado al portapapeles");
    };

    const handleResendInvite = async (id: number) => {
        try {
            await resendTeamInvitation(id, API_URL);
            toast.success("Invitación renovada por 7 días y reenviada");
            loadInvitations();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al reenviar la invitación");
        }
    };

    const handleCancelInvite = async (id: number) => {
        try {
            await cancelTeamInvitation(id, API_URL);
            toast.success("Invitación cancelada correctamente");
            loadInvitations();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al cancelar la invitación");
        }
    };

    const openEditModal = (member: TeamMember) => {
        setEditingMember(member);
        setExtractedCedulaMsg(null);
        setEditForm({
            full_name: member.full_name || "",
            job_title: member.job_title || "",
            professional_license: member.professional_license || "",
            professional_license_file_path: member.professional_license_file_path || "",
            professional_license_file_name: member.professional_license_file_name || "",
            license_institution: member.license_institution || "",
            phone_number: member.phone_number || "",
            new_password: "",
        });
    };

    const handleUpdateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;
        if (editForm.new_password && editForm.new_password.length < 8) {
            toast.error("La nueva contraseña debe tener al menos 8 caracteres");
            return;
        }
        setSubmitting(true);
        try {
            await updateTeamMember(
                editingMember.id,
                {
                    full_name: editForm.full_name.trim(),
                    job_title: editForm.job_title.trim() || undefined,
                    professional_license: editForm.professional_license.trim() || undefined,
                    professional_license_file_path: editForm.professional_license_file_path || undefined,
                    professional_license_file_name: editForm.professional_license_file_name || undefined,
                    license_institution: editForm.license_institution.trim() || undefined,
                    phone_number: editForm.phone_number.trim() || undefined,
                    new_password: editForm.new_password || undefined,
                },
                API_URL
            );
            toast.success("Datos del colaborador actualizados");
            setEditingMember(null);
            loadMembers();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al actualizar colaborador");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (member: TeamMember) => {
        try {
            if (member.is_active) {
                await deactivateTeamMember(member.id, API_URL);
                toast.success(`${member.full_name} fue desactivado`);
            } else {
                await updateTeamMember(member.id, { is_active: true }, API_URL);
                toast.success(`${member.full_name} fue reactivado`);
            }
            loadMembers();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo cambiar el estado del colaborador");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Equipo y Colaboradores</h1>
                    <p className="text-muted-foreground">
                        Integra abogados asociados y pasantes para asignarles la atención y seguimiento de expedientes.
                    </p>
                </div>
                {isOwner && (
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Registrar Colaborador
                    </Button>
                )}
            </div>
            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Directorio Jurídico del Despacho</CardTitle>
                    <CardDescription>
                        Los integrantes activos pueden consultar y gestionar expedientes del despacho y figurar como Abogado Responsable.
                    </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {loading ? (
                        <div className="py-8 text-center text-muted-foreground">Cargando equipo...</div>
                    ) : (
                        <Table className="min-w-[680px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Integrante</TableHead>
                                    <TableHead>Cargo / Rol</TableHead>
                                    <TableHead>Cédula Profesional</TableHead>
                                    <TableHead className="text-center">Expedientes</TableHead>
                                    <TableHead>Estado</TableHead>
                                    {isOwner && <TableHead className="text-right">Acciones</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{member.full_name}</span>
                                                <span className="text-xs text-muted-foreground">{member.email}</span>
                                                {member.phone_number && (
                                                    <span className="text-xs text-muted-foreground">{member.phone_number}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm">
                                                    {member.job_title || (member.role === "owner" ? "Socio Titular" : "Colaborador")}
                                                </span>
                                                <Badge variant="outline" className="w-fit text-[11px]">
                                                    {member.role === "owner" ? "Titular" : "Abogado / Pasante"}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div className="space-y-1">
                                                {member.professional_license ? (
                                                    <div className="font-medium text-foreground">
                                                        Cédula: {member.professional_license}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground italic text-xs">En trámite / N/A</span>
                                                )}
                                                {member.license_institution && (
                                                    <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                                                        {member.license_institution}
                                                    </div>
                                                )}
                                                {member.professional_license_file_path && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewCredential(member.id)}
                                                        className="h-6 px-1.5 text-xs text-primary gap-1"
                                                    >
                                                        <FileText className="h-3 w-3" /> Ver Credencial
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-semibold">
                                            {member.assigned_cases_count}
                                        </TableCell>
                                        <TableCell>
                                            {member.is_active ? (
                                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-none">
                                                    Activo
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Baja / Inactivo</Badge>
                                            )}
                                        </TableCell>
                                        {isOwner && (
                                            <TableCell className="text-right">
                                                {member.role === "lawyer" ? (
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditModal(member)}
                                                            title="Editar datos"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleActive(member)}
                                                            title={member.is_active ? "Dar de baja" : "Reactivar"}
                                                        >
                                                            {member.is_active ? (
                                                                <UserX className="h-4 w-4 text-destructive" />
                                                            ) : (
                                                                <UserCheck className="h-4 w-4 text-emerald-600" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Cuenta Titular</span>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Invitaciones Pendientes de Colaboradores (Enfoque A) */}
            {isOwner && invitations.length > 0 && (
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    Invitaciones Pendientes de Activación
                                </CardTitle>
                                <CardDescription>
                                    Colaboradores que aún no han definido su contraseña. Los enlaces tienen vigencia de 7 días.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400">
                                {invitations.length} pendiente{invitations.length > 1 ? "s" : ""}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Colaborador</TableHead>
                                    <TableHead>Correo</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invitations.map((inv) => {
                                    const isExpired = inv.status === "expired" || new Date(inv.expires_at) <= new Date();
                                    return (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-medium">{inv.full_name}</TableCell>
                                            <TableCell className="font-mono text-xs">{inv.email}</TableCell>
                                            <TableCell className="text-sm">{inv.job_title || "Abogado Asociado"}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        isExpired
                                                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300"
                                                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                                                    }
                                                >
                                                    {isExpired ? "Expirada" : "Pendiente"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {!isExpired && inv.token && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleCopyInviteLink(inv.token)}
                                                            title="Copiar enlace de activación"
                                                            className="text-xs h-8 px-2.5 cursor-pointer"
                                                        >
                                                            <Copy className="h-3.5 w-3.5 mr-1" />
                                                            Copiar enlace
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleResendInvite(inv.id)}
                                                        title="Reenviar y renovar por 7 días"
                                                        className="h-8 px-2 cursor-pointer"
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCancelInvite(inv.id)}
                                                        title="Cancelar invitación"
                                                        className="h-8 px-2 text-destructive hover:text-destructive cursor-pointer"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Modal Invitar Colaborador (Enfoque A: Sin contraseña manual) */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Invitar Abogado Colaborador o Pasante</DialogTitle>
                        <DialogDescription>
                            Envía una invitación segura. El colaborador definirá su propia contraseña personal al activar su cuenta.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInviteMember} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="col-name">Nombre Completo *</Label>
                            <Input
                                id="col-name"
                                placeholder="Ej: Lic. Mariana Ortiz Gómez"
                                value={createForm.full_name}
                                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="col-email">Correo Electrónico *</Label>
                            <Input
                                id="col-email"
                                type="email"
                                placeholder="mariana.ortiz@despacho.mx"
                                value={createForm.email}
                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="col-title">Cargo</Label>
                                <Input
                                    id="col-title"
                                    placeholder="Abogado Asociado / Pasante"
                                    value={createForm.job_title}
                                    onChange={(e) => setCreateForm({ ...createForm, job_title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="col-ced">Cédula Profesional</Label>
                                <Input
                                    id="col-ced"
                                    placeholder="Opcional si es pasante"
                                    value={createForm.professional_license}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, professional_license: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        {/* Dropzone Cédula / Carta de Pasante */}
                        <div className="space-y-1.5 p-3 rounded-lg border border-dashed border-border text-center bg-muted/20">
                            <Label className="text-xs font-semibold text-muted-foreground block text-left">
                                Respaldo Digital de Cédula Profesional DGP / Carta de Pasante
                            </Label>
                            <input
                                type="file"
                                id="col_cred_file_create"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleCredentialUpload(f, false);
                                }}
                                className="hidden"
                                disabled={extractingCedula}
                            />
                            {extractingCedula ? (
                                <div className="flex items-center justify-center gap-2 py-2 text-xs text-primary font-medium">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Extrayendo número de cédula e institución educativa...</span>
                                </div>
                            ) : createForm.professional_license_file_name ? (
                                <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800 text-xs text-left">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span className="truncate">{createForm.professional_license_file_name}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() =>
                                            setCreateForm((prev) => ({
                                                ...prev,
                                                professional_license_file_path: "",
                                                professional_license_file_name: "",
                                            }))
                                        }
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="col_cred_file_create"
                                    className="cursor-pointer flex flex-col items-center py-1.5 space-y-1"
                                >
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-xs font-medium text-foreground">
                                        Subir Cédula o Constancia (PDF / Imagen)
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        Autocompleta el número de cédula oficial DGP
                                    </span>
                                </label>
                            )}
                            {extractedCedulaMsg && (
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                                    {extractedCedulaMsg}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="col-phone">Teléfono</Label>
                            <Input
                                id="col-phone"
                                placeholder="Ej: 55 9876 5432"
                                value={createForm.phone_number}
                                onChange={(e) => setCreateForm({ ...createForm, phone_number: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting || extractingCedula}>
                                {submitting ? "Enviando invitación..." : "Enviar Invitación y Generar Enlace"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Editar Colaborador */}
            <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Colaborador</DialogTitle>
                        <DialogDescription>
                            Actualiza la información profesional o restablece la contraseña de acceso.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateMember} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nombre Completo *</Label>
                            <Input
                                value={editForm.full_name}
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Cargo</Label>
                                <Input
                                    value={editForm.job_title}
                                    onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cédula Profesional</Label>
                                <Input
                                    value={editForm.professional_license}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, professional_license: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        {/* Dropzone Cédula Edit */}
                        <div className="space-y-1.5 p-3 rounded-lg border border-dashed border-border text-center bg-muted/20">
                            <Label className="text-xs font-semibold text-muted-foreground block text-left">
                                Respaldo Digital de Cédula Profesional DGP / Carta de Pasante
                            </Label>
                            <input
                                type="file"
                                id="col_cred_file_edit"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleCredentialUpload(f, true);
                                }}
                                className="hidden"
                                disabled={extractingCedula}
                            />
                            {extractingCedula ? (
                                <div className="flex items-center justify-center gap-2 py-2 text-xs text-primary font-medium">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Extrayendo número de cédula e institución educativa...</span>
                                </div>
                            ) : editForm.professional_license_file_name ? (
                                <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800 text-xs text-left">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span className="truncate">{editForm.professional_license_file_name}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() =>
                                            setEditForm((prev) => ({
                                                ...prev,
                                                professional_license_file_path: "",
                                                professional_license_file_name: "",
                                            }))
                                        }
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="col_cred_file_edit"
                                    className="cursor-pointer flex flex-col items-center py-1.5 space-y-1"
                                >
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-xs font-medium text-foreground">
                                        Actualizar Cédula o Constancia (PDF / Imagen)
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        Autocompleta el número de cédula oficial DGP
                                    </span>
                                </label>
                            )}
                            {extractedCedulaMsg && (
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                                    {extractedCedulaMsg}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input
                                value={editForm.phone_number}
                                onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nueva Contraseña (opcional)</Label>
                            <Input
                                type="password"
                                placeholder="Dejar en blanco para conservar la actual"
                                value={editForm.new_password}
                                onChange={(e) => setEditForm({ ...editForm, new_password: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingMember(null)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SecuritySection() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.new_password !== formData.confirm_password) {
            toast.error("Las contraseñas no coinciden");
            return;
        }
        if (formData.new_password.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        setLoading(true);
        try {
            await changePassword(
                {
                    current_password: formData.current_password,
                    new_password: formData.new_password,
                },
                API_URL
            );
            toast.success("Contraseña actualizada correctamente");
            setFormData({ current_password: "", new_password: "", confirm_password: "" });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "No se pudo actualizar la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Seguridad</h1>
                <p className="text-muted-foreground">Protege tu acceso al sistema y el secreto profesional de tus asuntos.</p>
            </div>
            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Cambiar Contraseña</CardTitle>
                    <CardDescription>Actualiza periódicamente tu contraseña de acceso.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <Label htmlFor="current_password">Contraseña Actual</Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={formData.current_password}
                                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new_password">Nueva Contraseña</Label>
                            <Input
                                id="new_password"
                                type="password"
                                value={formData.new_password}
                                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm_password">Confirmar Nueva Contraseña</Label>
                            <Input
                                id="confirm_password"
                                type="password"
                                value={formData.confirm_password}
                                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? "Actualizando..." : "Actualizar Contraseña"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function SubscriptionSection() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const { checkout_url } = await createCheckoutSession(API_URL);
            window.location.href = checkout_url;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo iniciar la suscripción");
            setLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setLoading(true);
        try {
            const { portal_url } = await createCustomerPortalSession(API_URL);
            window.location.href = portal_url;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo abrir el portal de gestión");
            setLoading(false);
        }
    };

    const plans = [
        {
            name: "Plan Inicial (Gratuito)",
            price: "$0",
            period: "mes",
            features: [
                "Hasta 2 integrantes en el despacho",
                "Hasta 5 clientes activos",
                "Hasta 3 expedientes en trámite",
                "500 MB de archivo digital y Portal del Cliente",
            ],
            current: user?.subscription_plan === "free",
        },
        {
            name: "Plan Profesional / Despacho",
            price: "$499",
            period: "mes MXN",
            features: [
                "Colaboradores y expedientes ampliados",
                "Clientes ilimitados y Portal del Cliente",
                "10 GB+ para promociones, acuerdos y pruebas",
                "Estados de cuenta y alertas de términos fatales",
            ],
            current: user?.subscription_plan === "solo" || user?.subscription_plan === "firm",
            popular: true,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Suscripción del Despacho</h1>
                <p className="text-muted-foreground">Consulta la capacidad contratada de tu firma jurídica.</p>
            </div>
            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Estado Actual</CardTitle>
                    <CardDescription>
                        Plan activo: <span className="font-semibold uppercase">{user?.subscription_plan}</span> •{" "}
                        Estatus: <span className="font-semibold capitalize">{user?.subscription_status}</span>
                    </CardDescription>
                </CardHeader>
                {user?.subscription_plan !== "free" && (
                    <CardContent>
                        <Button onClick={handleManageSubscription} disabled={loading} variant="outline">
                            Administrar método de pago en Stripe
                        </Button>
                    </CardContent>
                )}
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {plans.map((plan) => (
                    <Card key={plan.name} className={plan.popular ? "border-primary shadow-md" : ""}>
                        <CardHeader>
                            {plan.popular && (
                                <div className="text-xs font-semibold text-primary mb-1 uppercase">Recomendado</div>
                            )}
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <div className="mt-2">
                                <span className="text-3xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground text-sm"> / {plan.period}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-2">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            {plan.current ? (
                                <Button className="w-full" disabled variant="secondary">
                                    Plan Activo
                                </Button>
                            ) : (
                                <Button className="w-full" onClick={handleUpgrade} disabled={loading}>
                                    Actualizar Plan
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
