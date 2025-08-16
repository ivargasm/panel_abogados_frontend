"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/Store";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter();
    const { registerUser, userAuth, user } = useAuthStore();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword)
    }

    // useEffect(() => {
    //     const validateUser = async () => {
    //         await userValid();
    //     };
    //     validateUser();
    // }, [userValid]);

    useEffect(() => {
        if ((userAuth || user)) {
            router.push('/profile');
        }
    }, [user, userAuth, router]);

    const [errors, setErrors] = useState<string[]>([]);

    const validateForm = () => {
        const newErrors = [];

        // Validar nombre de usuario
        if (!/^[a-zA-Z0-9]+$/.test(form.username)) {
            newErrors.push("El nombre de usuario solo puede contener letras y números.");
        }
        if (form.username.length < 3 || form.username.length > 50) {
            newErrors.push("El nombre de usuario debe tener entre 3 y 50 caracteres.");
        }

        // Validar email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.push("El correo electrónico no es válido.");
        }
        if (form.email.length > 50) {
            newErrors.push("El correo electrónico es demasiado largo.");
        }

        // Validar contraseña
        if (form.password.length < 8) {
            newErrors.push("La contraseña debe tener al menos 8 caracteres.");
        }
        if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password)) {
            newErrors.push("La contraseña debe incluir una mayúscula, una minúscula, un número y un carácter especial.");
        }
        if (form.password.length > 100) {
            newErrors.push("La contraseña es demasiado larga.");
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

        const success = await registerUser(form.username, form.email, form.password);
        if (success) {
            router.push("/auth/login");
        } else {
            setErrors(["Error al registrar. Inténtalo nuevamente."]);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <form onSubmit={handleSubmit}>
                <Card className="w-full max-w-md shadow-lg bg-white dark:bg-gray-800">
                    {errors.length > 0 && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                            {errors.map((error, index) => (
                                <p key={index}>• {error}</p>
                            ))}
                        </div>
                    )}
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">Crear cuenta</CardTitle>
                        <CardDescription className="text-center text-gray-500 dark:text-gray-400">Ingresa tus datos para registrarte</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-gray-700 dark:text-gray-300" htmlFor="username">Usuario</Label>
                            <Input className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" id="username" 
                                placeholder="Ingresa tu nombre de usuario" 
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value.trim() })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-700 dark:text-gray-300" htmlFor="email">Correo electrónico</Label>
                            <Input className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" id="email" type="email" 
                                placeholder="tu@ejemplo.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value.trim() })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-700 dark:text-gray-300" htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Input className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" id="password" 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Ingresa tu contraseña" 
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <EyeIcon className="h-4 w-4 text-gray-500" />
                                    )}
                                    <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">Repetir contraseña</Label>
                            <div className="relative">
                                <Input className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirma tu contraseña"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOffIcon className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <EyeIcon className="h-4 w-4 text-gray-500" />
                                    )}
                                    <span className="sr-only">{showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button className="w-full bg-gray-500 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-primary/90 text-white">
                            Registrarse
                        </Button>
                        <div className="text-center text-sm">
                            ¿Ya tienes una cuenta?{" "}
                            <Link href="/auth/login" className="text-slate-800 dark:text-slate-300 hover:underline font-medium">
                                Iniciar sesión
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

            </form>
        </div>
    );
}
