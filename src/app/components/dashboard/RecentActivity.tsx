"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, RefreshCw, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Activity {
    type: "document" | "case_update" | "task" | "message";
    description: string;
    timestamp: string;
    case_id?: number;
    case_title?: string;
}

interface RecentActivityProps {
    activities: Activity[];
}

const activityIcons = {
    document: FileText,
    case_update: RefreshCw,
    task: CheckCircle2,
    message: MessageSquare,
};

const activityColors = {
    document: "text-[var(--dashboard-document)]",
    case_update: "text-[var(--dashboard-status)]",
    task: "text-[var(--dashboard-task)]",
    message: "text-[var(--dashboard-message)]",
};

export default function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No hay actividad reciente
                        </p>
                    ) : (
                        activities.map((activity, index) => {
                            const Icon = activityIcons[activity.type];
                            const colorClass = activityColors[activity.type];

                            return (
                                <div key={index} className="flex gap-3">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center ${colorClass}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(activity.timestamp), {
                                                addSuffix: true,
                                                locale: es,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
