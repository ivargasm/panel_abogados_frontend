"use client";

import { useState } from "react";
import { Menu, X, FolderKanban, Users, CalendarDays, LogOut, LogIn, Sun, Moon, Briefcase } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "../store/Store";
import { Button } from "@/components/ui/button";

// Componente para un enlace de navegación, para no repetir código
const NavLink = ({ href, icon: Icon, text, onClick }: { href: string, icon: React.ElementType, text: string, onClick?: () => void }) => (
    <li>
        <Link href={href} onClick={onClick} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <Icon size={20} /> {text}
        </Link>
    </li>
);

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    // Obtenemos el usuario completo para poder leer su rol
    const { user, logout } = useAuthStore();
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
        document.documentElement.classList.toggle("dark");
    };

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        logout();
        closeMenu();
    };

    // Definimos los enlaces para cada rol
    const lawyerLinks = [
        { href: "/dashboard/clients", icon: Users, text: "Clientes" },
        { href: "/dashboard/cases", icon: FolderKanban, text: "Casos" },
        { href: "/dashboard/calendar", icon: CalendarDays, text: "Calendario" },
    ];

    const clientLinks = [
        { href: "/portal-cliente", icon: Briefcase, text: "Mi Portal" },
    ];

    const renderLinks = () => {
        if (!user) {
            return <NavLink href="/auth/login" icon={LogIn} text="Login" onClick={closeMenu} />;
        }

        const linksToRender = user.role === 'client' ? clientLinks : lawyerLinks;

        return (
            <>
                {linksToRender.map(link => <NavLink key={link.href} {...link} onClick={closeMenu} />)}
                <li>
                    <Link onClick={handleLogout} href="/" className="flex items-center gap-2 text-foreground hover:text-destructive transition-colors">
                        <LogOut size={20} /> Salir
                    </Link>
                </li>
            </>
        );
    };

    return (
        <nav className="sticky top-0 left-0 w-full bg-background/80 backdrop-blur-sm border-b z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-xl font-bold text-foreground">
                        LexControl
                    </Link>

                    {/* Menú para pantallas grandes */}
                    <ul className="hidden md:flex space-x-6 items-center">
                        {renderLinks()}
                        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>
                    </ul>

                    {/* Botón de menú para móviles */}
                    <div className="md:hidden flex items-center">
                         <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="mr-2">
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>
                        <button onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menú desplegable en móviles */}
            {menuOpen && (
                <div className="md:hidden bg-background border-t pb-4">
                    <ul className="flex flex-col items-center space-y-4">
                        {renderLinks()}
                    </ul>
                </div>
            )}
        </nav>
    );
}
