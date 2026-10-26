// app/components/NavLinks.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Briefcase,
    LayoutDashboard,
    Settings,
    Users,
    Calendar,
    Zap,
    BadgeDollarSign,
    Scale,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/app/store/Store";

export const DASHBOARD_NAV_LINKS = [
    { href: "/dashboard", label: "Resumen General", icon: LayoutDashboard },
    { href: "/dashboard/clients", label: "Clientes", icon: Users },
    { href: "/dashboard/cases", label: "Expedientes", icon: Briefcase },
    { href: "/dashboard/calendar", label: "Agenda Procesal", icon: Calendar },
    { href: "/dashboard/billing", label: "Honorarios y Cobranza", icon: BadgeDollarSign },
    { href: "/dashboard/subscription", label: "Plan del Despacho", icon: Zap, ownerOnly: true },
];

export default function NavLinks() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const isOwner = user?.role === "owner";

    const visibleLinks = DASHBOARD_NAV_LINKS.filter((link) => !link.ownerOnly || isOwner);

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname === href || pathname?.startsWith(`${href}/`);
    };

    return (
        <TooltipProvider delayDuration={150}>
            <nav className="flex h-full flex-col items-center gap-3 px-2 py-5">
                <Link
                    href="/dashboard"
                    className="group mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
                >
                    <Scale className="h-5 w-5" />
                    <span className="sr-only">LexControl</span>
                </Link>

                {visibleLinks.map((link) => {
                    const active = isActive(link.href);
                    return (
                        <Tooltip key={link.href}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={link.href}
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                                        active
                                            ? "bg-primary/15 text-primary font-semibold"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    <link.icon className="h-5 w-5" />
                                    <span className="sr-only">{link.label}</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">{link.label}</TooltipContent>
                        </Tooltip>
                    );
                })}

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href="/dashboard/settings"
                            className={`mt-auto flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                                isActive("/dashboard/settings")
                                    ? "bg-primary/15 text-primary font-semibold"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            <Settings className="h-5 w-5" />
                            <span className="sr-only">{isOwner ? "Configuración y Equipo" : "Mi Perfil y Ajustes"}</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{isOwner ? "Configuración y Equipo" : "Mi Perfil y Ajustes"}</TooltipContent>
                </Tooltip>
            </nav>
        </TooltipProvider>
    );
}
