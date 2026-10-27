"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronsUpDown, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { useAuthStore } from "@/app/store/Store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getMyWorkspaces, switchWorkspace, createWorkspace, WorkspaceItem } from "@/app/lib/api";
import { toast } from "sonner";

export default function WorkspaceSwitcher() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Modal para crear nuevo despacho
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const loadWorkspaces = async () => {
        try {
            const data = await getMyWorkspaces();
            setWorkspaces(data);
        } catch (error) {
            console.error("Error al cargar despachos:", error);
        }
    };

    useEffect(() => {
        loadWorkspaces();
    }, [user?.workspace_id]);

    const handleSwitch = async (targetWorkspaceId: number) => {
        if (targetWorkspaceId === user?.workspace_id) {
            setDropdownOpen(false);
            return;
        }

        try {
            setDropdownOpen(false);
            toast.loading("Cambiando al despacho seleccionado...", { id: "switching-ws" });
            const res = await switchWorkspace(targetWorkspaceId);
            toast.success(res.message || "Despacho cambiado exitosamente", { id: "switching-ws" });
            // Recargar para que todos los datos (casos, clientes, calendario) se hidraten con el nuevo contexto
            window.location.reload();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al cambiar de despacho", {
                id: "switching-ws",
            });
        }
    };

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newWorkspaceName.trim();
        if (!trimmed) {
            toast.error("Ingresa un nombre para el nuevo despacho.");
            return;
        }

        try {
            setIsCreating(true);
            toast.loading("Creando tu nuevo despacho...", { id: "create-ws" });
            const res = await createWorkspace(trimmed);
            toast.success(res.message || "Despacho creado exitosamente", { id: "create-ws" });
            setIsCreateModalOpen(false);
            setNewWorkspaceName("");
            window.location.reload();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al crear el despacho", {
                id: "create-ws",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const isOwner = user?.role === "owner";

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-2.5 py-1.5 h-auto text-left hover:bg-muted/70 transition-colors rounded-lg group focus-visible:ring-1"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold shrink-0 border border-primary/20">
                            <Building2 className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0 max-w-[160px] sm:max-w-[240px] md:max-w-[300px]">
                            <div className="flex items-center gap-1.5 truncate">
                                <span className="font-semibold text-sm truncate text-foreground">
                                    {user?.workspace_name || "Despacho Jurídico"}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Badge
                                    variant={isOwner ? "default" : "secondary"}
                                    className="text-[10px] px-1.5 py-0 h-4 font-medium uppercase tracking-wider"
                                >
                                    {isOwner ? "Titular" : "Colaborador"}
                                </Badge>
                                {user?.professional_license && (
                                    <span className="truncate hidden sm:inline text-[11px]">
                                        Cédula: {user.professional_license}
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0 ml-0.5" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-80 p-1.5 shadow-lg">
                    <DropdownMenuLabel className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
                        <span>Mis Despachos</span>
                        <span className="text-[10px] font-normal lowercase">
                            {workspaces.length} {workspaces.length === 1 ? "despacho" : "despachos"}
                        </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <div className="max-h-64 overflow-y-auto space-y-1 py-1">
                        {workspaces.map((ws) => {
                            const isCurrent = ws.is_active_workspace || ws.id === user?.workspace_id;
                            const isWsOwner = ws.role === "owner";

                            return (
                                <DropdownMenuItem
                                    key={ws.id}
                                    onClick={() => handleSwitch(ws.id)}
                                    className={`flex items-center justify-between cursor-pointer rounded-md p-2.5 transition-colors ${
                                        isCurrent
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "hover:bg-muted text-foreground"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                        <Building2
                                            className={`h-4 w-4 shrink-0 ${
                                                isCurrent ? "text-primary" : "text-muted-foreground"
                                            }`}
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <span className="truncate text-sm font-medium leading-tight">
                                                {ws.name}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground pt-0.5">
                                                {isWsOwner ? "Socio Titular" : "Colaborador"} • Plan {ws.subscription_plan.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    {isCurrent && (
                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                    )}
                                </DropdownMenuItem>
                            );
                        })}
                    </div>

                    <DropdownMenuSeparator />

                    {workspaces.some((ws) => ws.role === "owner") ? (
                        <DropdownMenuItem
                            onClick={() => {
                                setDropdownOpen(false);
                                router.push("/dashboard/subscription");
                            }}
                            className="cursor-pointer gap-2 text-emerald-600 dark:text-emerald-400 focus:text-emerald-700 font-medium p-2.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                            <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
                            <span>Mejorar Plan / Suscripción</span>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onClick={() => {
                                setDropdownOpen(false);
                                setIsCreateModalOpen(true);
                            }}
                            className="cursor-pointer gap-2 text-primary focus:text-primary font-medium p-2.5 rounded-md hover:bg-primary/5"
                        >
                            <Plus className="h-4 w-4 shrink-0" />
                            <span>Crear Mi Despacho Titular</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Modal para Crear Nuevo Despacho */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleCreateWorkspace}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <Building2 className="h-5 w-5 text-primary" />
                                Crear Nuevo Despacho Independiente
                            </DialogTitle>
                            <DialogDescription asChild>
                                <div className="text-sm text-foreground/80 space-y-2 pt-2">
                                    <p>
                                        Registra un nuevo espacio de trabajo aislado para gestionar tus propios clientes y litigios particulares.
                                    </p>
                                    <div className="rounded-md border bg-muted/40 p-2.5 text-xs text-muted-foreground flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span>
                                            Tus expedientes estarán protegidos por secreto profesional y no serán visibles para otros bufetes.
                                        </span>
                                    </div>
                                </div>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Nombre del Despacho o Firma *
                                </label>
                                <Input
                                    placeholder="ej. Vargas Litigio Particular / Bufete Jurídico..."
                                    value={newWorkspaceName}
                                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                                    disabled={isCreating}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                disabled={isCreating}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCreating || !newWorkspaceName.trim()}
                                className="bg-primary text-white hover:bg-primary/90"
                            >
                                {isCreating ? "Creando despacho..." : "Crear y Abrir Despacho"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
