"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/Store";
import { Users, Briefcase, Calendar, FileText, CheckCircle2 } from "lucide-react";
import StatsCard from "@/app/components/dashboard/StatsCard";
import RecentActivity from "@/app/components/dashboard/RecentActivity";
import UpcomingDeadlines from "@/app/components/dashboard/UpcomingDeadlines";
import { DashboardCard } from "@/app/components/dashboard/DashboardCard";
import { API_URL, getDashboardStats, getRecentActivity, getUpcomingDeadlines } from "@/app/lib/api";

export default function DashboardContent() {
    const { user } = useAuthStore();

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
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [statsData, activityData, deadlinesData] = await Promise.all([
                    getDashboardStats(API_URL),
                    getRecentActivity(API_URL, 6),
                    getUpcomingDeadlines(API_URL, 30),
                ]);
                setStats(statsData);
                setActivities(activityData);
                setDeadlines(deadlinesData);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Error al cargar indicadores del despacho");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="container mx-auto space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Bienvenido, {user?.full_name}
                </h1>
                <p className="text-muted-foreground mt-1">
                    Panel de control procesal, términos judiciales y estados de cuenta de{" "}
                    <span className="font-medium text-foreground">
                        {user?.workspace_name || "tu despacho jurídico"}
                    </span>
                    .
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Expedientes en Trámite"
                    value={loading ? "..." : stats.active_cases}
                    icon={Briefcase}
                    iconColor="text-[var(--dashboard-document)]"
                />
                <StatsCard
                    title="Audiencias y Términos"
                    value={loading ? "..." : stats.upcoming_hearings}
                    icon={Calendar}
                    iconColor="text-[var(--dashboard-message)]"
                />
                <StatsCard
                    title="Diligencias Pendientes"
                    value={loading ? "..." : stats.pending_tasks}
                    icon={CheckCircle2}
                    iconColor="text-[var(--dashboard-task)]"
                />
                <StatsCard
                    title="Clientes Representados"
                    value={loading ? "..." : stats.total_clients}
                    icon={Users}
                    iconColor="text-[var(--dashboard-status)]"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UpcomingDeadlines deadlines={deadlines} />
                <RecentActivity activities={activities} />
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4">Módulos del Despacho</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <DashboardCard
                        title="Cartera de Clientes"
                        description="Representados, RFC y Portal del Cliente"
                        href="/dashboard/clients"
                        icon={<Users className="h-7 w-7 text-sky-600" />}
                    />
                    <DashboardCard
                        title="Expedientes"
                        description="Carátulas procesales, juzgados y acuerdos"
                        href="/dashboard/cases"
                        icon={<Briefcase className="h-7 w-7 text-emerald-600" />}
                    />
                    <DashboardCard
                        title="Agenda Judicial"
                        description="Audiencias, términos fatales y alertas"
                        href="/dashboard/calendar"
                        icon={<Calendar className="h-7 w-7 text-amber-600" />}
                    />
                    <DashboardCard
                        title="Honorarios"
                        description="Estados de cuenta, anticipos y abonos"
                        href="/dashboard/billing"
                        icon={<FileText className="h-7 w-7 text-purple-600" />}
                    />
                </div>
            </div>
        </div>
    );
}
