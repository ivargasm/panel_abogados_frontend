"use client";

import Link from 'next/link';
import { Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/Store';
import { Button } from '@/components/ui/button';

export default function LandingNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [darkMode, setDarkMode] = useState(false);
    const { user, logout } = useAuthStore();

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
        document.documentElement.classList.toggle("dark");
    };

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    // Enlaces para abogados/admin
    const lawyerLinks = [
        { href: "/dashboard", text: "Dashboard" },
        { href: "/dashboard/clients", text: "Clientes" },
        { href: "/dashboard/cases", text: "Casos" },
        { href: "/dashboard/calendar", text: "Calendario" },
        { href: "/dashboard/billing", text: "Facturación" },
        { href: "/dashboard/settings", text: "Configuración" },
    ];

    // Enlaces para clientes
    const clientLinks = [
        { href: "/portal-cliente", text: "Mi Portal" },
    ];

    // Enlaces públicos (cuando no está logueado)
    const publicLinks = [
        { href: "#features", text: "Características" },
        { href: "#pricing", text: "Precios" },
        { href: "#about", text: "Acerca de" },
        { href: "#contact", text: "Contacto" },
    ];

    // Determinar qué enlaces mostrar según el estado del usuario
    const getNavigationLinks = () => {
        if (!user) return publicLinks;
        return user.role === 'client' ? clientLinks : lawyerLinks;
    };

    const navigationLinks = getNavigationLinks();

    return (
        <>
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 left-0 backdrop-blur-sm z-50">
                <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
                    {/* Logo */}
                    <div className="flex lg:flex-1">
                        <Link href={user ? (user.role === 'client' ? '/portal-cliente' : '/dashboard') : '/'} className="-m-1.5 p-1.5">
                            <span className="text-2xl font-bold text-primary">LexControl</span>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex lg:hidden items-center gap-x-2">
                        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>
                        <button
                            type="button"
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <span className="sr-only">Abrir menú</span>
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Desktop navigation */}
                    <div className="hidden lg:flex lg:gap-x-12">
                        {navigationLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary"
                            >
                                {link.text}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA buttons */}
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
                        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>

                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary"
                            >
                                <LogOut size={18} />
                                Cerrar Sesión
                            </button>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary">
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                    Solicitar Demo
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 z-[60] bg-black/30" onClick={() => setMobileMenuOpen(false)} />
                    <div className="fixed inset-y-0 right-0 z-[60] w-full overflow-y-auto bg-white dark:bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                        <div className="flex items-center justify-between">
                            <Link href={user ? (user.role === 'client' ? '/portal-cliente' : '/dashboard') : '/'} className="-m-1.5 p-1.5">
                                <span className="text-2xl font-bold text-primary">LexControl</span>
                            </Link>
                            <button
                                type="button"
                                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-300"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Cerrar menú</span>
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
                                <div className="space-y-2 py-6">
                                    {navigationLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                                            className="-mx-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
                                        >
                                            <LogOut size={18} />
                                            Cerrar Sesión
                                        </button>
                                    ) : (
                                        <>
                                            <Link
                                                href="/auth/login"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Iniciar Sesión
                                            </Link>
                                            <Link
                                                href="/auth/register"
                                                className="-mx-3 block rounded-lg bg-primary px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-primary/90"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Solicitar Demo
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
