// app/dashboard/layout.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Moon, Scale, Settings, Sun, UserCircle, X } from "lucide-react";
import { useAuthStore } from "@/app/store/Store";
import ProtectedRoute from "@/app/components/ProtectedRoutes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NavLinks, { DASHBOARD_NAV_LINKS } from "@/app/components/NavLinks";
import SessionExpiryWatcher from "@/app/components/SessionExpiryWatcher";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
    };

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle("dark");
    };

    const isOwner = user?.role === "owner";
    const mobileNavLinks = [
        ...DASHBOARD_NAV_LINKS.filter((item) => !item.ownerOnly || isOwner),
        {
            href: "/dashboard/settings",
            label: isOwner ? "Configuración y Equipo" : "Mi Perfil y Ajustes",
            icon: Settings,
        },
    ];

    return (
        <ProtectedRoute allowedRoles={["owner", "lawyer"]}>
            <SessionExpiryWatcher />
            <div className="flex min-h-screen w-full flex-col bg-secondary/30 dark:bg-background">
                {/* Barra lateral fija en escritorio */}
                <aside className="fixed inset-y-0 left-0 z-30 hidden w-16 flex-col border-r bg-background sm:flex print:hidden">
                    <NavLinks />
                </aside>

                {/* Drawer móvil */}
                {mobileOpen && (
                    <div className="fixed inset-0 z-50 sm:hidden print:hidden" role="dialog" aria-modal="true">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                        <div className="fixed inset-y-0 left-0 z-50 w-72 bg-background border-r p-5 flex flex-col">
                            <div className="flex items-center justify-between pb-4 border-b">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 font-bold text-primary text-lg"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Scale className="h-5 w-5" />
                                    <span>LexControl</span>
                                </Link>
                                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <nav className="mt-4 flex-1 space-y-1">
                                {mobileNavLinks.map((item) => {
                                    const active = item.href === "/dashboard"
                                        ? pathname === "/dashboard"
                                        : pathname?.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                                active
                                                    ? "bg-primary/15 text-primary"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="pt-4 border-t">
                                <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Cerrar Sesión
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:pl-16 min-h-screen">
                    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur px-4 sm:px-6 print:hidden">
                        <div className="flex items-center gap-3 min-w-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="sm:hidden"
                                onClick={() => setMobileOpen(true)}
                                aria-label="Abrir navegación"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                            <div className="truncate">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm sm:text-base text-foreground truncate">
                                        {user?.workspace_name || "Despacho Jurídico"}
                                    </span>
                                    <Badge variant="outline" className="hidden md:inline-flex text-xs">
                                        {user?.role === "owner" ? "Titular" : "Colaborador"}
                                    </Badge>
                                </div>
                                {user?.professional_license && (
                                    <p className="text-xs text-muted-foreground hidden sm:block">
                                        Cédula Profesional: {user.professional_license}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Cambiar tema">
                                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2 rounded-full pl-2 pr-3">
                                        <UserCircle className="h-5 w-5 text-primary" />
                                        <span className="hidden md:inline text-sm font-medium max-w-[160px] truncate">
                                            {user?.full_name || "Mi Cuenta"}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-0.5">
                                            <span className="font-semibold truncate">{user?.full_name}</span>
                                            <span className="text-xs font-normal text-muted-foreground truncate">
                                                {user?.email}
                                            </span>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                                        Perfil Profesional y Equipo
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push("/dashboard/billing")}>
                                        Honorarios y Cobranza
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push("/dashboard/subscription")}>
                                        Suscripción del Despacho
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Cerrar Sesión
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 print:p-0">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
