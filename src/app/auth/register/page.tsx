"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/Store";
import Link from "next/link";
import { Eye, EyeOff, Lock, Scale, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
    const router = useRouter();
    const { registerUser, userAuth, user } = useAuthStore();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if ((userAuth || user)) {
            router.push('/dashboard');
        }
    }, [user, userAuth, router]);

    const validateForm = () => {
        const newErrors = [];

        // Validar nombre de usuario
        if (!/^[a-zA-Z0-9\s]+$/.test(form.username)) {
            newErrors.push("El nombre solo puede contener letras y números.");
        }
        if (form.username.length < 3 || form.username.length > 50) {
            newErrors.push("El nombre debe tener entre 3 y 50 caracteres.");
        }

        // Validar email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.push("El correo electrónico no es válido.");
        }

        // Validar contraseña
        if (form.password.length < 8) {
            newErrors.push("La contraseña debe tener al menos 8 caracteres.");
        }

        // Validar confirmación de contraseña
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

        const success = await registerUser(form.username, form.email, form.password);
        if (success) {
            router.push("/auth/login");
        } else {
            setErrors(["Error al registrar. Inténtalo nuevamente o usa otro correo."]);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xl font-bold text-primary mb-6">
                            <Scale className="h-6 w-6" />
                            <span>LexControl</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Crea tu Cuenta</h2>
                        <p className="text-muted-foreground">
                            Optimiza tu práctica. Gestiona tus casos de forma segura con LexControl.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errors.length > 0 && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md space-y-1">
                                {errors.map((err, i) => (
                                    <p key={i}>• {err}</p>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="username">Nombre Completo</Label>
                            <Input
                                id="username"
                                placeholder="Ingresa tu nombre completo"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Ingresa tu correo electrónico"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Crea una contraseña"
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
                                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirma tu contraseña"
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
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2">
                            <Checkbox id="terms" required className="mt-1" />
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                            >
                                Al crear una cuenta, aceptas nuestros <Link href="#" className="text-primary hover:underline">Términos de Servicio</Link> y <Link href="#" className="text-primary hover:underline">Política de Privacidad</Link>.
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                        >
                            {loading ? "Creando cuenta..." : "Crear Cuenta"}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
                        <Link href="/auth/login" className="font-medium text-primary hover:underline">
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Panel - Image */}
            <div className="hidden lg:block w-1/2 bg-slate-900 relative">
                <div className="absolute inset-0">
                    <img
                        src="/register-visual.png"
                        alt="Legal Library"
                        className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                </div>
            </div>
        </div>
    );
}
