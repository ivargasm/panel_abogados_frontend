"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, Sun, Moon, Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/Store";
import { Button } from "@/components/ui/button";

export default function LandingNavbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, authChecked, userValid, logout } = useAuthStore();

    useEffect(() => {
        if (!authChecked) {
            userValid();
        }
    }, [authChecked, userValid]);

    // Ocultar en vistas internas que tienen su propio shell ejecutivo o pantalla dividida
    if (
        pathname?.startsWith("/dashboard") ||
        pathname?.startsWith("/portal-cliente") ||
        pathname?.startsWith("/auth")
    ) {
        return null;
    }

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle("dark");
    };

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    const lawyerLinks = [
        { href: "/dashboard", text: "Panel del Despacho" },
        { href: "/dashboard/clients", text: "Clientes" },
        { href: "/dashboard/cases", text: "Expedientes" },
        { href: "/dashboard/calendar", text: "Agenda Procesal" },
        { href: "/dashboard/billing", text: "Honorarios" },
        { href: "/dashboard/settings", text: "Configuración" },
    ];

    const clientLinks = [
        { href: "/portal-cliente", text: "Portal del Cliente" },
    ];

    const publicLinks = [
        { href: "/#features", text: "Características" },
        { href: "/#pricing", text: "Planes" },
        { href: "/#about", text: "Acerca de" },
        { href: "/#contact", text: "Contacto" },
    ];

    const navigationLinks = !user ? publicLinks : user.role === "client" ? clientLinks : lawyerLinks;

    return (
        <>
            <header className="bg-background/95 border-b border-border sticky top-0 left-0 backdrop-blur-sm z-50 print:hidden">
                <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <Link
                            href={user ? (user.role === "client" ? "/portal-cliente" : "/dashboard") : "/"}
                            className="flex items-center gap-2 -m-1.5 p-1.5"
                        >
                            <Scale className="h-6 w-6 text-primary" />
                            <span className="text-2xl font-bold text-primary">LexControl</span>
                        </Link>
                    </div>

                    <div className="flex lg:hidden items-center gap-x-2">
                        <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Cambiar tema">
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>
                        <button
                            type="button"
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <span className="sr-only">Abrir menú</span>
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="hidden lg:flex lg:gap-x-8">
                        {navigationLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
                            >
                                {link.text}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
                        <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Cambiar tema">
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    href={user.role === "client" ? "/portal-cliente" : "/dashboard"}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                                >
                                    Ir a mi Panel
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
                                >
                                    <LogOut size={16} />
                                    Salir
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-sm font-semibold leading-6 text-foreground hover:text-primary"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                                >
                                    Crear Despacho
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {mobileMenuOpen && (
                <div className="lg:hidden print:hidden" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setMobileMenuOpen(false)} />
                    <div className="fixed inset-y-0 right-0 z-[60] w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm border-l">
                        <div className="flex items-center justify-between">
                            <Link
                                href={user ? (user.role === "client" ? "/portal-cliente" : "/dashboard") : "/"}
                                className="flex items-center gap-2 -m-1.5 p-1.5"
                            >
                                <Scale className="h-6 w-6 text-primary" />
                                <span className="text-2xl font-bold text-primary">LexControl</span>
                            </Link>
                            <button
                                type="button"
                                className="-m-2.5 rounded-md p-2.5 text-foreground"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Cerrar menú</span>
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-border">
                                <div className="space-y-2 py-6">
                                    {navigationLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {link.text}
                                        </Link>
                                    ))}
                                </div>
                                <div className="py-6 space-y-2">
                                    {user ? (
                                        <button
                                            onClick={handleLogout}
                                            className="-mx-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-muted w-full"
                                        >
                                            <LogOut size={18} />
                                            Cerrar Sesión
                                        </button>
                                    ) : (
                                        <>
                                            <Link
                                                href="/auth/login"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Iniciar Sesión
                                            </Link>
                                            <Link
                                                href="/auth/register"
                                                className="-mx-3 block rounded-lg bg-primary px-3 py-2.5 text-base font-semibold leading-7 text-primary-foreground hover:bg-primary/90 text-center"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Crear Despacho
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
