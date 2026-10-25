"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/Store";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Scale } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
    const router = useRouter();
    const { registerUser, userAuth, user } = useAuthStore();

    const [form, setForm] = useState({
        username: "",
        workspaceName: "",
        professionalLicense: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (userAuth && user) {
            router.push(user.role === "client" ? "/portal-cliente" : "/dashboard");
        }
    }, [user, userAuth, router]);

    const validateForm = () => {
        const newErrors: string[] = [];
        const trimmedName = form.username.trim();

        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,'-]+$/.test(trimmedName)) {
            newErrors.push("El nombre contiene caracteres no permitidos.");
        }
        if (trimmedName.length < 3 || trimmedName.length > 80) {
            newErrors.push("El nombre debe tener entre 3 y 80 caracteres.");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            newErrors.push("El correo electrónico no es válido.");
        }

        if (form.password.length < 8) {
            newErrors.push("La contraseña debe tener al menos 8 caracteres.");
        }

        if (form.password !== form.confirmPassword) {
            newErrors.push("Las contraseñas no coinciden.");
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        setErrors([]);

        try {
            await registerUser(form.username.trim(), form.email.trim(), form.password, {
                workspace_name: form.workspaceName.trim() || undefined,
                professional_license: form.professionalLicense.trim() || undefined,
            });
            toast.success("Despacho creado exitosamente. Inicia sesión para continuar.");
            router.push("/auth/login");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al registrar la cuenta.";
            setErrors([msg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">
            <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
                <div className="w-full max-w-md space-y-6">
                    <div className="space-y-2">
                        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary mb-4 w-fit">
                            <Scale className="h-6 w-6" />
                            <span>LexControl</span>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight">Registra tu Despacho</h2>
                        <p className="text-muted-foreground">
                            Gestiona expedientes judiciales, plazos procesales, honorarios y Portal del Cliente en un solo lugar.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errors.length > 0 && (
                            <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-md space-y-1">
                                {errors.map((err, i) => (
                                    <p key={i}>• {err}</p>
                                ))}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="username">Nombre del Abogado Titular *</Label>
                            <Input
                                id="username"
                                placeholder="Ej. Lic. María Fernanda Gómez Pérez"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="workspaceName">Nombre del Despacho</Label>
                                <Input
                                    id="workspaceName"
                                    placeholder="Ej. Gómez & Asociados"
                                    value={form.workspaceName}
                                    onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="professionalLicense">Cédula Profesional</Label>
                                <Input
                                    id="professionalLicense"
                                    placeholder="Ej. 12849302"
                                    value={form.professionalLicense}
                                    onChange={(e) => setForm({ ...form, professionalLicense: e.target.value })}
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email">Correo Electrónico *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="contacto@despacho.mx"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">Contraseña (mínimo 8 caracteres) *</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Crea una contraseña segura"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                    className="h-11 pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Repite tu contraseña"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    required
                                    className="h-11 pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2 pt-1">
                            <Checkbox id="terms" required className="mt-1" />
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-snug text-muted-foreground"
                            >
                                Acepto los{" "}
                                <Link href="/terms" className="text-primary hover:underline">
                                    Términos de Servicio
                                </Link>{" "}
                                y el{" "}
                                <Link href="/privacy" className="text-primary hover:underline">
                                    Aviso de Privacidad
                                </Link>
                                .
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11"
                            disabled={loading}
                        >
                            {loading ? "Registrando despacho..." : "Crear Cuenta del Despacho"}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">¿Ya cuentas con acceso? </span>
                        <Link href="/auth/login" className="font-medium text-primary hover:underline">
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </div>

            <div className="hidden lg:block w-1/2 bg-slate-900 relative">
                <div className="absolute inset-0">
                    <Image
                        src="https://res.cloudinary.com/ivargasm/image/upload/v1764351068/LexControl/register-visual_knlibj.jpg"
                        alt="Biblioteca Jurídica"
                        fill
                        className="w-full h-full object-cover opacity-90"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                </div>
            </div>
        </div>
    );
}
