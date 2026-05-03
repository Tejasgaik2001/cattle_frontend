'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CowHealthBreedingRow } from '@/lib/api/health-breeding';
import {
    Search, Filter, Eye, PlusCircle, Syringe,
    Activity, Baby, Stethoscope, Heart, ChevronDown
} from 'lucide-react';

type StatusFilter = 'All' | 'Healthy' | 'Under Treatment' | 'Pregnant' | 'Dry';

interface CowHealthTableProps {
    cows: CowHealthBreedingRow[];
    isLoading: boolean;
    onViewHistory: (cow: CowHealthBreedingRow) => void;
    onAddHealthRecord: (cow: CowHealthBreedingRow) => void;
    onAddBreedingEvent: (cow: CowHealthBreedingRow) => void;
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    'Healthy': {
        label: 'Healthy',
        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 shadow-sm',
        icon: <Heart className="h-3 w-3" />,
    },
    'Under Treatment': {
        label: 'Under Treatment',
        className: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400 border border-red-200 dark:border-red-500/30 shadow-sm',
        icon: <Stethoscope className="h-3 w-3" />,
    },
    'Pregnant': {
        label: 'Pregnant',
        className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shadow-sm',
        icon: <Baby className="h-3 w-3" />,
    },
    'Dry': {
        label: 'Dry',
        className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 shadow-sm',
        icon: <Activity className="h-3 w-3" />,
    },
};

const statusFilters: StatusFilter[] = ['All', 'Healthy', 'Under Treatment', 'Pregnant', 'Dry'];

export function CowHealthTable({
    cows,
    isLoading,
    onViewHistory,
    onAddHealthRecord,
    onAddBreedingEvent,
}: CowHealthTableProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

    const filtered = useMemo(() => {
        return cows.filter(cow => {
            const matchesSearch =
                search === '' ||
                cow.tagId.toLowerCase().includes(search.toLowerCase()) ||
                (cow.name && cow.name.toLowerCase().includes(search.toLowerCase()));
            const matchesStatus =
                statusFilter === 'All' || cow.healthStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [cows, search, statusFilter]);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
            <CardHeader className="pb-4 bg-slate-50/30 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                            <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        Cow Health & Breeding
                    </CardTitle>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">{filtered.length} cows</span>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Tag ID or Name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {statusFilters.map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                                    statusFilter === s
                                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No cows match your search/filter.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800/50">
                                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tag ID</th>
                                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Name</th>
                                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden md:table-cell">Health History</th>
                                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden lg:table-cell">Last Breeding</th>
                                    <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden lg:table-cell">Expectancy</th>
                                    <th className="text-right px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {filtered.map(cow => {
                                    const status = statusConfig[cow.healthStatus] ?? statusConfig['Healthy'];
                                    return (
                                        <tr
                                            key={cow.id}
                                            className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all cursor-default"
                                        >
                                            <td className="px-4 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                {cow.tagId}
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-200">
                                                {cow.name ?? <span className="text-slate-300 dark:text-slate-600 italic">Unnamed</span>}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.className}`}>
                                                    {status.icon}
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 hidden md:table-cell">
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-slate-900 dark:text-slate-100 text-xs font-bold">{formatDate(cow.lastHealthEventDate)}</p>
                                                    {cow.lastHealthEventDescription && (
                                                        <p className="text-slate-500 dark:text-slate-500 text-[11px] truncate max-w-[180px]" title={cow.lastHealthEventDescription}>
                                                            {cow.lastHealthEventDescription}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 hidden lg:table-cell">
                                                {cow.lastBreedingEventDate ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-slate-900 dark:text-slate-100 text-xs font-bold">{formatDate(cow.lastBreedingEventDate)}</p>
                                                        {cow.lastBreedingEventType && (
                                                            <p className="text-slate-500 dark:text-slate-500 text-[11px] capitalize">{cow.lastBreedingEventType}</p>
                                                        )}
                                                    </div>
                                                ) : <span className="text-slate-300 dark:text-slate-700">—</span>}
                                            </td>
                                            <td className="px-4 py-4 hidden lg:table-cell">
                                                {cow.expectedCalvingDate ? (
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded text-xs">
                                                        {formatDate(cow.expectedCalvingDate)}
                                                    </span>
                                                ) : <span className="text-slate-300 dark:text-slate-700">—</span>}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => onViewHistory(cow)}
                                                        title="View History"
                                                        className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onAddHealthRecord(cow)}
                                                        title="Add Health Record"
                                                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                                    >
                                                        <Stethoscope className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onAddBreedingEvent(cow)}
                                                        title="Add Breeding Event"
                                                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                                                    >
                                                        <Baby className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
