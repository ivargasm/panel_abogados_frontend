"use client";

import { useState } from "react";
import { forgot_password } from "../../lib/api";
import { useAuthStore } from "../../store/Store";
import Link from "next/link";
import { Mail, Scale, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const { url } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!email) {
            setError("Por favor, ingrese su correo electrónico.");
            return;
        }

        setIsLoading(true);

        try {
            const data = await forgot_password(url, email);
            if (data) {
                const result = await data.json();
                setMessage(result.message);
                toast.success("¡Operación exitosa!", { description: "Se ha enviado un enlace de recuperación a tu correo." });
            } else {
                setError("Error al enviar la solicitud.");
                toast.error("¡Algo salió mal!", { description: "No se pudo enviar el correo de recuperación." });
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message || "Error al enviar la solicitud.");
            } else {
                setError("Error al enviar la solicitud.");
            }
        } finally {
            setIsLoading(false);
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
                            Restablecer tu Contraseña
                        </CardTitle>
                        <CardDescription className="text-gray-500 dark:text-gray-400">
                            Ingresa tu correo electrónico para recibir un enlace de recuperación.
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
                                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                                    Correo Electrónico
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="tu@ejemplo.com"
                                        className="pl-10 h-11 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-2">
                            <Button
                                type="submit"
                                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? "Enviando..." : "Enviar Enlace"}
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
