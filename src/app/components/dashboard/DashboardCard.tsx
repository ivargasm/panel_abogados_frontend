import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

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