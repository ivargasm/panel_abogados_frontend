"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Scale, AlertOctagon, MapPin } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Deadline {
    id: number;
    title: string;
    date: string;
    type: string;
    is_fatal_deadline?: boolean;
    location?: string | null;
    urgency: "urgent" | "soon" | "normal";
    case_id?: number | null;
    case_title?: string | null;
}

interface UpcomingDeadlinesProps {
    deadlines: Deadline[];
}

const urgencyConfig = {
    urgent: {
        label: "URGENTE",
        className: "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border-red-200 dark:border-red-800",
    },
    soon: {
        label: "PRÓXIMO",
        className: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    },
    normal: {
        label: null,
        className: "",
    },
};

export default function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Semáforo de Términos y Audiencias</CardTitle>
                <CardDescription>Próximos 30 días en juzgados y agenda procesal</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {deadlines.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            No hay audiencias ni términos pendientes en los próximos 30 días.
                        </p>
                    ) : (
                        deadlines.map((deadline) => {
                            const urgency = urgencyConfig[deadline.urgency];
                            const content = (
                                <div className="flex items-start justify-between gap-3 pb-4 border-b last:border-0 last:pb-0 hover:bg-muted/30 rounded-md p-2 -mx-2 transition-colors">
                                    <div className="flex gap-3 flex-1 min-w-0">
                                        <div
                                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                                deadline.is_fatal_deadline
                                                    ? "bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400"
                                                    : "bg-muted text-primary"
                                            }`}
                                        >
                                            {deadline.is_fatal_deadline ? (
                                                <AlertOctagon className="h-5 w-5" />
                                            ) : (
                                                <Scale className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <p className="text-sm font-semibold text-foreground">
                                                    {deadline.title}
                                                </p>
                                                {deadline.is_fatal_deadline && (
                                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                                        TÉRMINO FATAL
                                                    </Badge>
                                                )}
                                            </div>
                                            {deadline.case_title && (
                                                <p className="text-xs text-primary/90 font-medium mt-0.5 truncate">
                                                    {deadline.case_title}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(deadline.date), "d 'de' MMM yyyy, HH:mm", {
                                                        locale: es,
                                                    })}
                                                </span>
                                                {deadline.location && (
                                                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                                                        <MapPin className="h-3 w-3" />
                                                        {deadline.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {urgency.label && (
                                        <Badge variant="outline" className={`shrink-0 ${urgency.className}`}>
                                            {urgency.label}
                                        </Badge>
                                    )}
                                </div>
                            );

                            return deadline.case_id ? (
                                <Link key={deadline.id} href={`/dashboard/cases/${deadline.case_id}`} className="block">
                                    {content}
                                </Link>
                            ) : (
                                <div key={deadline.id}>{content}</div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
