'use client';

import React, { useState, useEffect } from 'react';
import { X, Stethoscope, Baby, Syringe, Calendar, ChevronRight, User, Pill, ClipboardList } from 'lucide-react';
import type { CowHealthBreedingRow, CowHistory, CowEventHistoryItem } from '@/lib/api/health-breeding';
import { healthBreedingApi } from '@/lib/api/health-breeding';

interface CowDetailDrawerProps {
    cow: CowHealthBreedingRow | null;
    onClose: () => void;
    onAddHealthRecord: (cow: CowHealthBreedingRow) => void;
    onAddBreedingEvent: (cow: CowHealthBreedingRow) => void;
}

type Tab = 'health' | 'breeding' | 'vaccination';

const tabConfig: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'health', label: 'Health', icon: <Stethoscope className="h-4 w-4" /> },
    { id: 'breeding', label: 'Breeding', icon: <Baby className="h-4 w-4" /> },
    { id: 'vaccination', label: 'Vaccination', icon: <Syringe className="h-4 w-4" /> },
];

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function HealthEventCard({ event }: { event: CowEventHistoryItem }) {
    const m = event.metadata ?? {};
    return (
        <div className="relative pl-8 pb-5 border-l-2 border-red-500/30 ml-3 last:border-transparent">
            <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 ml-3">
                <div className="flex justify-between items-start">
                    <p className="font-semibold text-white text-sm">{m.diagnosis ?? event.description}</p>
                    <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0 ml-2">
                        <Calendar className="h-3 w-3" />{formatDate(event.date)}
                    </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                    {m.treatmentType && <span className="flex items-center gap-1"><ClipboardList className="h-3 w-3 text-slate-500" />{m.treatmentType}</span>}
                    {m.medication && <span className="flex items-center gap-1"><Pill className="h-3 w-3 text-slate-500" />{m.medication}</span>}
                    {m.vetName && <span className="flex items-center gap-1"><User className="h-3 w-3 text-slate-500" />Dr. {m.vetName}</span>}
                    {m.withdrawalDays && <span className="text-amber-400">⚠ {m.withdrawalDays}d withdrawal</span>}
                </div>
                {m.notes && <p className="text-xs text-slate-500 mt-2 italic">{m.notes}</p>}
            </div>
        </div>
    );
}

function BreedingEventCard({ event }: { event: CowEventHistoryItem }) {
    const m = event.metadata ?? {};
    const typeColor = m.eventType === 'pregnancy_confirmed'
        ? 'border-violet-500 bg-violet-500/20'
        : m.eventType === 'insemination'
            ? 'border-blue-500 bg-blue-500/20'
            : 'border-amber-500 bg-amber-500/20';
    const typeLabel = { heat: 'Heat Detection', insemination: 'Insemination', pregnancy_confirmed: 'Pregnancy Confirmed' }[m.eventType as string] ?? m.eventType ?? 'Breeding Event';

    return (
        <div className="relative pl-8 pb-5 border-l-2 border-violet-500/30 ml-3 last:border-transparent">
            <div className={`absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center ${typeColor}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 ml-3">
                <div className="flex justify-between items-start">
                    <p className="font-semibold text-white text-sm">{typeLabel}</p>
                    <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0 ml-2">
                        <Calendar className="h-3 w-3" />{formatDate(event.date)}
                    </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                    {m.sire && <span>Bull/Semen: <span className="text-slate-200">{m.sire}</span></span>}
                    {m.technicianName && <span className="flex items-center gap-1"><User className="h-3 w-3 text-slate-500" />{m.technicianName}</span>}
                    {m.expectedCalvingDate && (
                        <span className="text-violet-300 font-medium">Expected calving: {formatDate(m.expectedCalvingDate)}</span>
                    )}
                </div>
                {m.notes && <p className="text-xs text-slate-500 mt-2 italic">{m.notes}</p>}
            </div>
        </div>
    );
}

function VaccinationEventCard({ event }: { event: CowEventHistoryItem }) {
    const m = event.metadata ?? {};
    return (
        <div className="relative pl-8 pb-5 border-l-2 border-emerald-500/30 ml-3 last:border-transparent">
            <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 ml-3">
                <div className="flex justify-between items-start">
                    <p className="font-semibold text-white text-sm">{m.vaccineName ?? event.description}</p>
                    <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0 ml-2">
                        <Calendar className="h-3 w-3" />{formatDate(event.date)}
                    </span>
                </div>
                {m.nextDueDate && (
                    <p className="text-xs text-amber-400 mt-1">Next due: {formatDate(m.nextDueDate)}</p>
                )}
                {m.notes && <p className="text-xs text-slate-500 mt-2 italic">{m.notes}</p>}
            </div>
        </div>
    );
}

export function CowDetailDrawer({ cow, onClose, onAddHealthRecord, onAddBreedingEvent }: CowDetailDrawerProps) {
    const [activeTab, setActiveTab] = useState<Tab>('health');
    const [history, setHistory] = useState<CowHistory | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!cow) return;
        setHistory(null);
        setActiveTab('health');
        setIsLoading(true);
        healthBreedingApi.getCowHistory(cow.id)
            .then(setHistory)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [cow?.id]);

    if (!cow) return null;

    const tabEvents: Record<Tab, CowEventHistoryItem[]> = {
        health: history?.health ?? [],
        breeding: history?.breeding ?? [],
        vaccination: history?.vaccination ?? [],
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-slate-700">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-lg font-bold text-emerald-400">{cow.tagId}</span>
                            {cow.name && <span className="text-slate-400 text-sm">/ {cow.name}</span>}
                        </div>
                        <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            cow.healthStatus === 'Healthy' ? 'bg-emerald-500/15 text-emerald-400' :
                            cow.healthStatus === 'Under Treatment' ? 'bg-red-500/15 text-red-400' :
                            cow.healthStatus === 'Pregnant' ? 'bg-violet-500/15 text-violet-400' :
                            'bg-amber-500/15 text-amber-400'
                        }`}>{cow.healthStatus}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onAddHealthRecord(cow)}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 border border-red-600/40 text-red-300 hover:bg-red-600/30 text-xs rounded-lg transition-colors"
                        >
                            <Stethoscope className="h-3.5 w-3.5" /> Add Health
                        </button>
                        <button
                            onClick={() => onAddBreedingEvent(cow)}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 border border-violet-600/40 text-violet-300 hover:bg-violet-600/30 text-xs rounded-lg transition-colors"
                        >
                            <Baby className="h-3.5 w-3.5" /> Add Breeding
                        </button>
                        <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700 px-5">
                    {tabConfig.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                                activeTab === tab.id
                                    ? 'border-emerald-500 text-emerald-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {history && (
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                    activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'
                                }`}>
                                    {tabEvents[tab.id].length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                        </div>
                    ) : tabEvents[activeTab].length === 0 ? (
                        <div className="text-center py-16">
                            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                                {tabConfig.find(t => t.id === activeTab)?.icon}
                            </div>
                            <p className="text-slate-500 text-sm">No {activeTab} records found.</p>
                            {activeTab === 'health' && (
                                <button
                                    onClick={() => onAddHealthRecord(cow)}
                                    className="mt-3 text-xs text-emerald-400 hover:underline"
                                >
                                    + Add health record
                                </button>
                            )}
                            {activeTab === 'breeding' && (
                                <button
                                    onClick={() => onAddBreedingEvent(cow)}
                                    className="mt-3 text-xs text-emerald-400 hover:underline"
                                >
                                    + Add breeding event
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="mt-2">
                            {activeTab === 'health' && tabEvents.health.map(e => <HealthEventCard key={e.id} event={e} />)}
                            {activeTab === 'breeding' && tabEvents.breeding.map(e => <BreedingEventCard key={e.id} event={e} />)}
                            {activeTab === 'vaccination' && tabEvents.vaccination.map(e => <VaccinationEventCard key={e.id} event={e} />)}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
