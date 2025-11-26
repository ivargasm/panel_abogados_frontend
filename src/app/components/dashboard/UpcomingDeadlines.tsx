"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Scale } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Deadline {
    id: number;
    title: string;
    date: string;
    type: string;
    urgency: "urgent" | "soon" | "normal";
    case_id?: number;
    case_title?: string | null;
}

interface UpcomingDeadlinesProps {
    deadlines: Deadline[];
}

const urgencyConfig = {
    urgent: {
        label: "URGENTE",
        className: "bg-[var(--badge-urgent)] text-[var(--badge-urgent-foreground)]",
    },
    soon: {
        label: "PRÓXIMO",
        className: "bg-[var(--badge-soon)] text-[var(--badge-soon-foreground)]",
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
                <CardTitle>Vencimientos y Audiencias</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {deadlines.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No hay vencimientos próximos
                        </p>
                    ) : (
                        deadlines.map((deadline) => {
                            const urgency = urgencyConfig[deadline.urgency];

                            return (
                                <div key={deadline.id} className="flex items-start justify-between gap-3 pb-4 border-b last:border-0 last:pb-0">
                                    <div className="flex gap-3 flex-1 min-w-0">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary">
                                            <Scale className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">
                                                {deadline.title}
                                            </p>
                                            {deadline.case_title && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {deadline.case_title}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(deadline.date), "d 'de' MMMM, yyyy", { locale: es })}
                                            </div>
                                        </div>
                                    </div>
                                    {urgency.label && (
                                        <Badge className={urgency.className}>
                                            {urgency.label}
                                        </Badge>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
