"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { reset_password } from "../../lib/api";
import { useAuthStore } from "../../store/Store";
import Link from "next/link";
import { Eye, EyeOff, Scale, ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPasswordClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const { url } = useAuthStore();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Password Strength Logic
    const [strength, setStrength] = useState(0);

    useEffect(() => {
        let score = 0;
        if (password.length > 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        setStrength(score);
    }, [password]);

    const getStrengthColor = () => {
        if (strength === 0) return "bg-gray-200";
        if (strength <= 2) return "bg-red-500";
        if (strength === 3) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStrengthText = () => {
        if (strength === 0) return "";
        if (strength <= 2) return "Débil";
        if (strength === 3) return "Media";
        return "Fuerte";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (strength < 3) {
            setError("La contraseña es demasiado débil. Usa mayúsculas, números y símbolos.");
            return;
        }

        setLoading(true);

        try {
            if (token) {
                const data = await reset_password(url, password, token);
                if (data) {
                    const result = await data.json();
                    setMessage(result.message);
                    toast.success("¡Contraseña restablecida!", { description: "Ahora puedes iniciar sesión con tu nueva contraseña." });
                    setTimeout(() => router.push("/auth/login"), 2000);
                } else {
                    setError("Error al enviar la solicitud.");
                    toast.error("Error", { description: "No se pudo restablecer la contraseña." });
                }
            } else {
                setError("Token no válido o expirado.");
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message || "Error al enviar la solicitud.");
            } else {
                setError("Error al enviar la solicitud.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header Branding */}
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                        <Scale className="h-8 w-8" />
                        <span>LexControl</span>
                    </div>
                </div>

                <Card className="w-full shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Establecer Nueva Contraseña
                        </CardTitle>
                        <CardDescription className="text-gray-500 dark:text-gray-400">
                            Tu nueva contraseña debe ser diferente a las anteriores.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {message && (
                                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                                    {message}
                                </div>
                            )}
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">Nueva Contraseña</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Ingresa tu nueva contraseña"
                                        className="pr-10 h-11"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
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
                                {/* Strength Indicator */}
                                {password && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1 h-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-full flex-1 rounded-full transition-colors ${i <= strength ? getStrengthColor() : "bg-gray-200 dark:bg-gray-700"}`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs text-right ${strength <= 2 ? "text-red-500" : strength === 3 ? "text-yellow-500" : "text-green-500"}`}>
                                            {getStrengthText()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirma tu nueva contraseña"
                                        className="pr-10 h-11"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
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
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-2">
                            <Button
                                type="submit"
                                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white"
                                disabled={loading}
                            >
                                {loading ? "Restableciendo..." : "Restablecer Contraseña"}
                            </Button>

                            <Link
                                href="/auth/login"
                                className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver al Inicio de Sesión
                            </Link>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
