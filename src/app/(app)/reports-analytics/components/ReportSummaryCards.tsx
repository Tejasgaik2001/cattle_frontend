import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, DollarSign, Droplets, PieChart } from 'lucide-react';

interface SummaryStat {
    label: string;
    value: string | number;
    subValue?: string;
    icon: React.ElementType;
    color: string;
}

interface ReportSummaryCardsProps {
    stats: SummaryStat[];
}

export function ReportSummaryCards({ stats }: ReportSummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
                <Card key={idx} className="bg-white dark:bg-slate-900 border-none shadow-sm overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 group-hover:scale-110 transition-transform ${stat.color}`} />
                        <div className="flex items-center gap-4 relative">
                            <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10`}>
                                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                                {stat.subValue && (
                                    <p className="text-xs text-slate-400 mt-0.5">{stat.subValue}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
