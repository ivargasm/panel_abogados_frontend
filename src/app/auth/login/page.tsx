"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/Store";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Lock, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const { url, loginUser } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const validateAndRedirect = async () => {
            const state = useAuthStore.getState();
            if (state.userAuth && state.user) {
                if (state.user.role === 'client') {
                    router.push('/portal-cliente');
                } else {
                    router.push('/dashboard');
                }
            }
        };
        validateAndRedirect();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userData = await loginUser(email, password, url);
            if (userData?.role === 'client') {
                router.push("/portal-cliente");
            } else {
                router.push("/dashboard");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocurrió un error desconocido");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12 text-white relative overflow-hidden">
                {/* Background Pattern/Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-0" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-2 text-2xl font-bold">
                    <Scale className="h-8 w-8" />
                    <span>LexControl</span>
                </div>

                {/* Central Visual Placeholder */}
                <div className="relative z-10 flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                        <Image
                            src="https://res.cloudinary.com/ivargasm/image/upload/v1764350297/LexControl/login-visual_a1kj12.jpg"
                            alt="Legal Tech Visualization"
                            fill
                            className="w-full h-full object-cover opacity-90 rounded-2xl"
                            priority
                        />
                    </div>
                </div>

                {/* Bottom Text */}
                <div className="relative z-10 space-y-4 max-w-lg">
                    <h1 className="text-4xl font-bold leading-tight">
                        Gestión Inteligente de Casos, Simplificada.
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Optimiza tu práctica, asegura tus datos y enfócate en lo que más importa: tus clientes.
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Iniciar Sesión en LexControl</h2>
                        <p className="text-muted-foreground">
                            ¡Bienvenido de nuevo! Por favor ingresa tus datos.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tucorreo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Contraseña</Label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                "Iniciando sesión..."
                            ) : (
                                <>
                                    <Lock className="mr-2 h-4 w-4" /> Iniciar Sesión
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">¿No tienes una cuenta? </span>
                        <Link href="/auth/register" className="font-medium text-primary hover:underline">
                            Regístrate
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
