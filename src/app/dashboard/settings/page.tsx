"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Settings, Lock, Bell, Blocks, CreditCard, Check } from "lucide-react";
import { useAuthStore } from "@/app/store/Store";
import { toast } from "sonner";
import { createCheckoutSession, createCustomerPortalSession } from "@/app/lib/api";

type Section = "general" | "profile" | "security" | "notifications" | "integrations" | "subscription";

export default function SettingsLayout() {
    const [activeSection, setActiveSection] = useState<Section>("profile");

    const menuItems = [
        { id: "general" as Section, label: "General", icon: Settings },
        { id: "profile" as Section, label: "Perfil de Usuario", icon: User },
        { id: "security" as Section, label: "Seguridad", icon: Lock },
        { id: "notifications" as Section, label: "Notificaciones", icon: Bell },
        { id: "integrations" as Section, label: "Integraciones", icon: Blocks },
        { id: "subscription" as Section, label: "Suscripción", icon: CreditCard },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-8 md:w-full">
            {/* Sidebar */}
            <aside className="md:w-64 flex-shrink-0">
                <nav className="flex flex-col space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Button
                                key={item.id}
                                variant={activeSection === item.id ? "secondary" : "ghost"}
                                className={`justify-start ${activeSection === item.id
                                    ? "font-medium"
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

            {/* Main Content */}
            <div className="flex-1">
                {activeSection === "profile" && <ProfileSection />}
                {activeSection === "security" && <SecuritySection />}
                {activeSection === "subscription" && <SubscriptionSection />}
                {activeSection === "general" && <GeneralSection />}
                {activeSection === "notifications" && <ComingSoonSection title="Notificaciones" />}
                {activeSection === "integrations" && <ComingSoonSection title="Integraciones" />}
            </div>
        </div>
    );
}

function ComingSoonSection({ title }: { title: string }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">Esta sección estará disponible próximamente.</p>
            </div>
        </div>
    );
}

function GeneralSection() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">General</h1>
                <p className="text-muted-foreground">Configuración general de la aplicación.</p>
            </div>
            <Separator />
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Tema</Label>
                            <p className="text-sm text-muted-foreground">
                                Personaliza la apariencia de la aplicación.
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">Claro</Button>
                            <Button variant="outline" size="sm" className="bg-slate-950 text-white hover:bg-slate-800 hover:text-white">Oscuro</Button>
                            <Button variant="outline" size="sm">Sistema</Button>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Idioma</Label>
                            <p className="text-sm text-muted-foreground">
                                Selecciona el idioma de la interfaz.
                            </p>
                        </div>
                        <Button variant="outline" disabled>Español (México)</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ProfileSection() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || "",
        phone_number: user?.phone_number || "",
        job_title: user?.job_title || "",
    });

    React.useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || "",
                phone_number: user.phone_number || "",
                job_title: user.job_title || "",
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { updateUserProfile } = await import("@/app/lib/api");
            const apiUrl = useAuthStore.getState().url;
            const updatedUser = await updateUserProfile(formData, apiUrl);
            useAuthStore.setState({ user: updatedUser });
            toast.success("Perfil actualizado correctamente");
        } catch (error) {
            console.error("Error:", error);
            toast.error("No se pudo actualizar tu perfil. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño y tipo (opcional pero recomendado)
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("El archivo es demasiado grande. Máximo 5MB.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Solo se permiten archivos de imagen.");
            return;
        }

        const toastId = toast.loading("Subiendo foto de perfil...");

        try {
            const { initiateProfilePictureUpload, uploadFileToS3, updateUserProfile } = await import("@/app/lib/api");
            const apiUrl = useAuthStore.getState().url;

            // 1. Obtener URL firmada
            const { upload_url, file_path } = await initiateProfilePictureUpload(file.name, file.type, file.size, apiUrl);

            // 2. Subir a S3
            await uploadFileToS3(upload_url, file);

            // 3. Actualizar perfil con la nueva URL (path)
            const updatedUser = await updateUserProfile({ profile_picture_url: file_path }, apiUrl);

            // 4. Actualizar estado local
            useAuthStore.setState({ user: updatedUser });

            toast.success("Foto de perfil actualizada", { id: toastId });
        } catch (error: any) {
            console.error("Error uploading profile picture:", error);
            toast.error(error.message || "Error al subir la foto", { id: toastId });
        } finally {
            // Limpiar input
            e.target.value = "";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Perfil de Usuario</h1>
                <p className="text-muted-foreground">Gestiona tu información personal y configuración del perfil.</p>
            </div>
            <Separator />

            <Card>
                <CardContent className="p-6 space-y-8">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user?.profile_picture_url || ""} alt="Avatar" />
                            <AvatarFallback className="text-lg bg-pink-200 text-pink-700">
                                {user?.full_name ? getInitials(user.full_name) : "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 text-center sm:text-left flex-1">
                            <h3 className="text-xl font-semibold">{user?.full_name || "Usuario"}</h3>
                            <p className="text-sm text-muted-foreground">{user?.job_title || "Sin cargo"}</p>
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
                                className="bg-gray-50"
                                onClick={() => document.getElementById("avatar-upload")?.click()}
                            >
                                Subir nueva foto
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Personal Information Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h3 className="text-lg font-medium">Información Personal</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Nombre Completo</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="job_title">Cargo</Label>
                                <Input
                                    id="job_title"
                                    value={formData.job_title}
                                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" value={user?.email || ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Teléfono</Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    if (user) {
                                        setFormData({
                                            full_name: user.full_name || "",
                                            phone_number: user.phone_number || "",
                                            job_title: user.job_title || "",
                                        });
                                    }
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-[#1e293b] hover:bg-[#0f172a]" disabled={loading}>
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
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
            const { changePassword } = await import("@/app/lib/api");
            const apiUrl = useAuthStore.getState().url;
            await changePassword({
                current_password: formData.current_password,
                new_password: formData.new_password,
            }, apiUrl);

            toast.success("Contraseña actualizada correctamente");
            setFormData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
        } catch (error: any) {
            console.error("Error:", error);
            toast.error(error.message || "No se pudo actualizar la contraseña. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Seguridad</h1>
                <p className="text-muted-foreground">Gestiona tu contraseña y configuración de seguridad.</p>
            </div>
            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Cambiar Contraseña</CardTitle>
                    <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            <p className="text-sm text-muted-foreground">Mínimo 8 caracteres</p>
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

                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                    setFormData({
                                        current_password: "",
                                        new_password: "",
                                        confirm_password: "",
                                    })
                                }
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-[#1e293b] hover:bg-[#0f172a]" disabled={loading}>
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
            const apiUrl = useAuthStore.getState().url;
            const { checkout_url } = await createCheckoutSession(apiUrl);
            window.location.href = checkout_url;
        } catch (error) {
            console.error("Error:", error);
            toast.error("No se pudo iniciar el proceso de actualización");
            setLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setLoading(true);
        try {
            const apiUrl = useAuthStore.getState().url;
            const { portal_url } = await createCustomerPortalSession(apiUrl);
            window.location.href = portal_url;
        } catch (error) {
            console.error("Error:", error);
            toast.error("No se pudo abrir el portal de gestión");
            setLoading(false);
        }
    };

    const plans = [
        {
            name: "Free",
            price: "$0",
            period: "gratis",
            features: ["1 usuario", "Hasta 5 casos", "Almacenamiento básico", "Soporte por email"],
            current: user?.subscription_plan === "free",
        },
        {
            name: "Solo",
            price: "$29",
            period: "mes",
            features: ["1 usuario", "Casos ilimitados", "10 GB almacenamiento", "Soporte prioritario", "Reportes básicos"],
            current: user?.subscription_plan === "solo",
            popular: true,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Suscripción</h1>
                <p className="text-muted-foreground">Gestiona tu plan y facturación.</p>
            </div>
            <Separator />

            {/* Current Plan Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Plan Actual</CardTitle>
                    <CardDescription>
                        Estás en el plan <span className="font-semibold capitalize">{user?.subscription_plan}</span> -{" "}
                        Estado: <span className="font-semibold capitalize">{user?.subscription_status}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {user?.subscription_plan !== "free" && (
                        <Button onClick={handleManageSubscription} disabled={loading} variant="outline">
                            Gestionar Suscripción
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Plans */}
            <div className="grid gap-6 md:grid-cols-2">
                {plans.map((plan) => (
                    <Card key={plan.name} className={plan.popular ? "border-primary shadow-lg" : ""}>
                        <CardHeader>
                            {plan.popular && (
                                <div className="text-xs font-semibold text-primary mb-2">MÁS POPULAR</div>
                            )}
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground">/{plan.period}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-2">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            {plan.current ? (
                                <Button className="w-full" disabled>
                                    Plan Actual
                                </Button>
                            ) : (
                                <Button
                                    className="w-full bg-[#1e293b] hover:bg-[#0f172a]"
                                    onClick={handleUpgrade}
                                    disabled={loading}
                                >
                                    {plan.name === "Free" ? "Cambiar a Free" : "Actualizar"}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
