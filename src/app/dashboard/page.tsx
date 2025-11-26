"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuthStore } from '@/app/store/Store';
import ProtectedRoute from '@/app/components/ProtectedRoutes';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Briefcase, Calendar, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import StatsCard from '@/app/components/dashboard/StatsCard';
import RecentActivity from '@/app/components/dashboard/RecentActivity';
import UpcomingDeadlines from '@/app/components/dashboard/UpcomingDeadlines';
import { getDashboardStats, getRecentActivity, getUpcomingDeadlines } from '@/app/lib/api';

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, userValid } = useAuthStore();

    const [stats, setStats] = useState({
        active_cases: 0,
        upcoming_hearings: 0,
        pending_tasks: 0,
        total_clients: 0,
    });
    const [activities, setActivities] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Escuchamos los parámetros de la URL al cargar la página
        const paymentStatus = searchParams.get('payment');

        if (paymentStatus === 'success') {
            toast.success('¡Pago exitoso!', {
                description: 'Tu plan ha sido actualizado a Profesional. ¡Bienvenido!',
            });
            // Refrescamos los datos del usuario para que la UI se actualice con el nuevo plan
            userValid();
            // Limpiamos la URL para que el mensaje no vuelva a aparecer si se recarga
            router.replace('/dashboard');
        }
    }, [searchParams, router, userValid]);

    useEffect(() => {
        // Cargar datos del dashboard
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const { url } = useAuthStore.getState();

                // Fetch stats
                const statsData = await getDashboardStats(url);
                setStats(statsData);

                // Fetch recent activity
                const activityData = await getRecentActivity(url, 5);
                setActivities(activityData);

                // Fetch upcoming deadlines
                const deadlinesData = await getUpcomingDeadlines(url, 30);
                setDeadlines(deadlinesData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Error al cargar datos del dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <ProtectedRoute allowedRoles={['owner', 'lawyer']}>
            <div className="container mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Bienvenido, {user?.username}</h1>
                    <p className="text-muted-foreground">Gestiona tu práctica legal desde un solo lugar.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        title="Casos Activos"
                        value={loading ? "..." : stats.active_cases}
                        icon={Briefcase}
                        iconColor="text-[var(--dashboard-document)]"
                    />
                    <StatsCard
                        title="Audiencias Próximas"
                        value={loading ? "..." : stats.upcoming_hearings}
                        icon={Calendar}
                        iconColor="text-[var(--dashboard-message)]"
                    />
                    <StatsCard
                        title="Tareas Pendientes"
                        value={loading ? "..." : stats.pending_tasks}
                        icon={CheckCircle2}
                        iconColor="text-[var(--dashboard-task)]"
                    />
                    <StatsCard
                        title="Total Clientes"
                        value={loading ? "..." : stats.total_clients}
                        icon={Users}
                        iconColor="text-[var(--dashboard-status)]"
                    />
                </div>

                {/* Activity and Deadlines */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <RecentActivity activities={activities} />
                    <UpcomingDeadlines deadlines={deadlines} />
                </div>

                {/* Quick Links */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Accesos Rápidos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <DashboardCard
                            title="Clientes"
                            description="Gestiona tus clientes"
                            href="/dashboard/clients"
                            icon={<Users className="h-8 w-8 text-blue-500" />}
                        />
                        <DashboardCard
                            title="Casos"
                            description="Administra los expedientes"
                            href="/dashboard/cases"
                            icon={<Briefcase className="h-8 w-8 text-green-500" />}
                        />
                        <DashboardCard
                            title="Calendario"
                            description="Controla tus vencimientos"
                            href="/dashboard/calendar"
                            icon={<Calendar className="h-8 w-8 text-yellow-500" />}
                        />
                        <DashboardCard
                            title="Facturación"
                            description="Administra tus facturas"
                            href="/dashboard/billing"
                            icon={<FileText className="h-8 w-8 text-red-500" />}
                        />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

// Componente de tarjeta reutilizable para el dashboard
export function DashboardCard({ title, description, href, icon }: { title: string, description: string, href: string, icon: React.ReactNode }) {
    return (
        <Link href={href}>
            <Card className="hover:border-primary hover:shadow-lg transition-all duration-200 group">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-muted p-3 rounded-lg">
                                {icon}
                            </div>
                            <div>
                                <CardTitle>{title}</CardTitle>
                                <CardDescription>{description}</CardDescription>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                </CardHeader>
            </Card>
        </Link>
    );
}
