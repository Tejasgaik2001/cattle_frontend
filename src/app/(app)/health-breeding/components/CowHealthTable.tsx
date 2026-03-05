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
        className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        icon: <Heart className="h-3 w-3" />,
    },
    'Under Treatment': {
        label: 'Under Treatment',
        className: 'bg-red-500/15 text-red-400 border border-red-500/30',
        icon: <Stethoscope className="h-3 w-3" />,
    },
    'Pregnant': {
        label: 'Pregnant',
        className: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
        icon: <Baby className="h-3 w-3" />,
    },
    'Dry': {
        label: 'Dry',
        className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
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
        <Card className="bg-slate-800/50 border border-slate-700 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-emerald-400" />
                        Cow Health & Breeding
                    </CardTitle>
                    <span className="text-sm text-slate-400">{filtered.length} cows</span>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mt-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Tag ID or Name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {statusFilters.map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                    statusFilter === s
                                        ? 'bg-emerald-600 border-emerald-500 text-white'
                                        : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200'
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
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No cows match your search/filter.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700 bg-slate-900/50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Tag ID</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Last Health Event</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">Last Breeding</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">Expected Calving</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filtered.map(cow => {
                                    const status = statusConfig[cow.healthStatus] ?? statusConfig['Healthy'];
                                    return (
                                        <tr
                                            key={cow.id}
                                            className="group hover:bg-slate-700/30 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-mono font-semibold text-emerald-400">
                                                {cow.tagId}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {cow.name ?? <span className="text-slate-600 italic">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                                                    {status.icon}
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <div>
                                                    <p className="text-slate-300 text-xs">{formatDate(cow.lastHealthEventDate)}</p>
                                                    {cow.lastHealthEventDescription && (
                                                        <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[160px]" title={cow.lastHealthEventDescription}>
                                                            {cow.lastHealthEventDescription}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 text-xs hidden lg:table-cell">
                                                {cow.lastBreedingEventDate ? (
                                                    <div>
                                                        <p>{formatDate(cow.lastBreedingEventDate)}</p>
                                                        {cow.lastBreedingEventType && (
                                                            <p className="text-slate-500 capitalize">{cow.lastBreedingEventType}</p>
                                                        )}
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 text-xs hidden lg:table-cell">
                                                {cow.expectedCalvingDate ? (
                                                    <span className="text-violet-400 font-medium">
                                                        {formatDate(cow.expectedCalvingDate)}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => onViewHistory(cow)}
                                                        title="View History"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onAddHealthRecord(cow)}
                                                        title="Add Health Record"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Stethoscope className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onAddBreedingEvent(cow)}
                                                        title="Add Breeding Event"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
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
