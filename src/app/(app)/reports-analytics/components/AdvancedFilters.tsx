import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Calendar, Filter, X } from 'lucide-react';
import { format } from 'date-fns';

export type Timeframe = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'monthly' | 'quarterly' | 'yearly' | 'financial_year' | 'custom';

interface AdvancedFiltersProps {
    onFilterChange: (filters: any) => void;
    filters: any;
}

export function AdvancedFilters({ onFilterChange, filters }: AdvancedFiltersProps) {
    const timeframes = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last_7_days', label: 'Last 7 Days' },
        { value: 'last_30_days', label: 'Last 30 Days' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'yearly', label: 'Yearly' },
        { value: 'financial_year', label: 'Financial Year' },
        { value: 'custom', label: 'Custom Range' },
    ];

    const handleChange = (name: string, value: any) => {
        onFilterChange({ ...filters, [name]: value });
    };

    return (
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-visible">
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-end">
                    {/* Timeframe Select */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Timeframe</label>
                        <select
                            value={filters.timeframe}
                            onChange={(e) => handleChange('timeframe', e.target.value)}
                            className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                        >
                            {timeframes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>

                    {/* Custom Range (Conditional) */}
                    {filters.timeframe === 'custom' && (
                        <>
                            <div className="flex-1 min-w-[150px]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Start Date</label>
                                <input
                                    type="date"
                                    value={filters.startDate || ''}
                                    onChange={(e) => handleChange('startDate', e.target.value)}
                                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none"
                                />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">End Date</label>
                                <input
                                    type="date"
                                    value={filters.endDate || ''}
                                    onChange={(e) => handleChange('endDate', e.target.value)}
                                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none"
                                />
                            </div>
                        </>
                    )}

                    {/* Search */}
                    <div className="flex-[2] min-w-[250px]">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Search Keywords</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by Tag ID, Name, or Description..."
                                value={filters.search || ''}
                                onChange={(e) => handleChange('search', e.target.value)}
                                className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Reset button */}
                    <button
                        onClick={() => onFilterChange({ timeframe: 'last_30_days' })}
                        className="h-11 px-4 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                        title="Reset Filters"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
