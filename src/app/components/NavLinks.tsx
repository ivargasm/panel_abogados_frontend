// app/components/NavLinks.tsx
// Este componente de cliente se encarga de renderizar la barra de navegación lateral.

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, LayoutDashboard, Settings, User, Calendar, Zap, BadgeDollarSign } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function NavLinks() {
    const pathname = usePathname();

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/clients', label: 'Clientes', icon: User },
        { href: '/dashboard/cases', label: 'Casos', icon: Briefcase },
        { href: '/dashboard/calendar', label: 'Calendario', icon: Calendar },
        { href: '/dashboard/billing', label: 'Facturación', icon: BadgeDollarSign },
        { href: '/dashboard/subscription', label: 'Suscripción', icon: Zap },
    ];

    return (
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5 mt-18">
                <Link
                    href="/dashboard"
                    className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                    <Briefcase className="h-4 w-4 transition-all group-hover:scale-110" />
                    <span className="sr-only">LexControl</span>
                </Link>
                {links.map((link) => (
                    <Tooltip key={link.label}>
                        <TooltipTrigger asChild>
                            <Link
                                href={link.href}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${pathname === link.href
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-foreground hover:text-foreground'
                                    }`}
                            >
                                <link.icon className="h-5 w-5" />
                                <span className="sr-only">{link.label}</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{link.label}</TooltipContent>
                    </Tooltip>
                ))}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href="/dashboard/settings"
                            className={`mt-auto flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${pathname === '/dashboard/settings'
                                ? 'bg-accent text-accent-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Settings className="h-5 w-5" />
                            <span className="sr-only">Configuración</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Configuración</TooltipContent>
                </Tooltip>
            </nav>
        </TooltipProvider>
    );
}
